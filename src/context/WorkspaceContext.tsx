/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Unified IP-Bound Workspace & Access Control Context
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Finding,
  HeuristicItem,
  IcebergItem,
  ImpactEffortItem,
  JourneyTouchpoint,
  Project,
  SurveyResponse,
  User,
  WcagCriterion,
} from '../types';
import { INITIAL_PROJECTS, INITIAL_USERS } from '../data/initialData';
import {
  calculateSusScore,
  findUserByIp,
  getAccessibleProjects,
  toggleProjectUserAccess,
} from '../utils/evaluationLogic';

const STORAGE_KEYS = {
  USERS: 'savia_users_v7',
  PROJECTS: 'savia_projects_v7',
  CURRENT_USER_ID: 'savia_current_user_id_v7',
  IS_AUTHENTICATED: 'savia_is_authenticated_v7',
  CURRENT_PROJECT_ID: 'savia_current_project_id_v7',
};

interface WorkspaceContextValue {
  members: User[];
  currentUser: User;
  isAuthenticated: boolean;
  detectedClientIp: string;
  loginWithIp: (ipOrUserId: string) => { ok: boolean; error?: string };
  logout: () => void;

  projects: Project[];
  allProjects: Project[];
  currentProject: Project | null;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  createProject: (data: {
    title: string;
    objective: string;
    scope: string;
    productType: string;
    activeMethods: Project['activeMethods'];
    collaboratorIds?: string[];
  }) => Project;
  updateProject: (projectId: string, partial: Partial<Project>) => void;

  toggleProjectPermission: (projectId: string, userId: string) => void;
  toggleUserAdmin: (userId: string) => void;
  inviteMember: (name: string, role: string, email: string, ipAddress?: string) => void;
  bindIpToUser: (userId: string, ipAddress: string) => void;

  addIcebergItem: (
    projectId: string,
    item: Omit<IcebergItem, 'id' | 'authorId' | 'authorName' | 'authorIp' | 'createdAt'>
  ) => void;
  deleteIcebergItem: (projectId: string, itemId: string) => void;

  addHeuristicItem: (
    projectId: string,
    item: Omit<HeuristicItem, 'id' | 'authorId' | 'authorName' | 'createdAt'>
  ) => void;
  updateHeuristicItem: (projectId: string, itemId: string, partial: Partial<HeuristicItem>) => void;
  deleteHeuristicItem: (projectId: string, itemId: string) => void;

  addJourneyStage: (
    projectId: string,
    stage: Omit<JourneyTouchpoint, 'id' | 'authorId' | 'authorName'>
  ) => void;
  deleteJourneyStage: (projectId: string, stageId: string) => void;

  addSusResponse: (
    projectId: string,
    respondentName: string,
    respondentRole: string,
    answers: number[],
    openFeedback?: string
  ) => void;

  updateWcagItem: (projectId: string, criterionId: string, partial: Partial<WcagCriterion>) => void;

  addImpactEffortItem: (
    projectId: string,
    item: Omit<ImpactEffortItem, 'id' | 'votes' | 'votedUserIds' | 'authorId' | 'authorName'>
  ) => void;
  voteImpactEffortItem: (projectId: string, itemId: string) => void;

  approveFinding: (
    projectId: string,
    finding: Omit<Finding, 'id' | 'authorName' | 'approvedBy' | 'approvedAt'>
  ) => void;
  updateFinding: (projectId: string, findingId: string, partial: Partial<Finding>) => void;
  deleteFinding: (projectId: string, findingId: string) => void;

  submitSurveyResponse: (
    projectId: string,
    response: Omit<SurveyResponse, 'id' | 'submittedAt'>
  ) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<User[]>(() =>
    loadJson<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS)
  );
  const [allProjects, setAllProjects] = useState<Project[]>(() =>
    loadJson<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS)
  );
  const [currentUserId, setCurrentUserId] = useState<string>(() =>
    localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || INITIAL_USERS[0].id
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return true;
    return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
  });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT_ID)
  );
  const [detectedClientIp, setDetectedClientIp] = useState<string>('127.0.0.1');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(allProjects));
  }, [allProjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT_ID, currentProjectId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT_ID);
    }
  }, [currentProjectId]);

  useEffect(() => {
    let active = true;
    fetch('/api/session/ip')
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.ipAddress) return;
        const ip = String(data.ipAddress).trim();
        setDetectedClientIp(ip);

        setMembers((prev) => {
          const alreadyBound = findUserByIp(prev, ip);
          if (alreadyBound) return prev;
          return prev.map((u) => (u.id === 'usr_andres' ? { ...u, ipAddress: ip } : u));
        });
      })
      .catch(() => {
        // Ignore network error on offline fallback
      });
    return () => {
      active = false;
    };
  }, []);

  const currentUser = useMemo(
    () => members.find((m) => m.id === currentUserId) || members[0],
    [members, currentUserId]
  );

  const projects = useMemo(
    () => getAccessibleProjects(allProjects, currentUser, false),
    [allProjects, currentUser]
  );

  const currentProject = useMemo(() => {
    if (!currentProjectId) return null;
    const pool = currentUser?.isAdmin ? allProjects : projects;
    return pool.find((p) => p.id === currentProjectId) || null;
  }, [currentProjectId, currentUser, allProjects, projects]);

  const loginWithIp = (ipOrUserId: string): { ok: boolean; error?: string } => {
    const clean = ipOrUserId.trim();
    if (!clean) {
      return { ok: false, error: 'Ingresa una dirección IP válida.' };
    }
    const matched =
      members.find((u) => u.id === clean) || findUserByIp(members, clean);
    if (!matched) {
      return { ok: false, error: `No existe un usuario autorizado con la IP ${clean}.` };
    }
    setCurrentUserId(matched.id);
    setCurrentProjectId(null);
    setIsAuthenticated(true);
    return { ok: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentProjectId(null);
  };

  const updateProject = (projectId: string, partial: Partial<Project>) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, ...partial, updatedAt: 'Ahora' } : p
      )
    );
  };

  const createProject = (data: {
    title: string;
    objective: string;
    scope: string;
    productType: string;
    activeMethods: Project['activeMethods'];
    collaboratorIds?: string[];
  }): Project => {
    const collabs = Array.from(
      new Set([currentUser.id, ...(data.collaboratorIds || [])])
    );
    const newProj: Project = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      companyId: 'comp_savia',
      title: data.title,
      objective: data.objective,
      scope: data.scope,
      productType: data.productType,
      status: 'activo',
      leadId: currentUser.id,
      collaboratorIds: collabs,
      activeMethods: data.activeMethods,
      updatedAt: 'Recién creado',
      icebergItems: [],
      heuristicItems: [],
      journeyStages: [],
      usabilityTasks: [],
      susRespondents: [],
      cardCategories: [],
      cardItems: [],
      wcagItems: [],
      impactEffortItems: [],
      blueprintSteps: [],
      surveyQuestions: [
        {
          id: 'q_' + Math.random().toString(36).substring(2, 6),
          type: 'rating_scale',
          title: '¿Qué tan fácil fue completar tu objetivo? (1-10)',
          required: true,
        },
      ],
      surveyResponses: [],
      findings: [],
    };
    setAllProjects((prev) => [newProj, ...prev]);
    return newProj;
  };

  const toggleProjectPermission = (projectId: string, userId: string) => {
    if (!currentUser.isAdmin) return;
    setAllProjects((prev) =>
      prev.map((p) => (p.id === projectId ? toggleProjectUserAccess(p, userId) : p))
    );
  };

  const toggleUserAdmin = (userId: string) => {
    if (!currentUser.isAdmin || userId === currentUser.id) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, isAdmin: !m.isAdmin } : m))
    );
  };

  const inviteMember = (name: string, role: string, email: string, ipAddress?: string) => {
    const ip =
      ipAddress?.trim() ||
      `190.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;
    const palette = ['#FF6B1A', '#B892FF', '#22D3EE', '#EC4899', '#818CF8'];
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      role: role.trim() || 'Investigador',
      email: email.trim(),
      avatarColor: palette[members.length % palette.length],
      ipAddress: ip,
      isAdmin: false,
    };
    setMembers((prev) => [...prev, newUser]);
  };

  const bindIpToUser = (userId: string, ipAddress: string) => {
    const clean = ipAddress.trim();
    if (!clean) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, ipAddress: clean } : m))
    );
  };

  const addIcebergItem = (
    projectId: string,
    item: Omit<IcebergItem, 'id' | 'authorId' | 'authorName' | 'authorIp' | 'createdAt'>
  ) => {
    const newItem: IcebergItem = {
      ...item,
      id: 'ice_' + Math.random().toString(36).substring(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorIp: currentUser.ipAddress,
      createdAt: new Date().toISOString(),
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, icebergItems: [newItem, ...p.icebergItems], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  const deleteIcebergItem = (projectId: string, itemId: string) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, icebergItems: p.icebergItems.filter((i) => i.id !== itemId) }
          : p
      )
    );
  };

  const addHeuristicItem = (
    projectId: string,
    item: Omit<HeuristicItem, 'id' | 'authorId' | 'authorName' | 'createdAt'>
  ) => {
    const newItem: HeuristicItem = {
      ...item,
      id: 'h_' + Math.random().toString(36).substring(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, heuristicItems: [newItem, ...p.heuristicItems], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  const updateHeuristicItem = (
    projectId: string,
    itemId: string,
    partial: Partial<HeuristicItem>
  ) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              heuristicItems: p.heuristicItems.map((h) =>
                h.id === itemId ? { ...h, ...partial } : h
              ),
            }
          : p
      )
    );
  };

  const deleteHeuristicItem = (projectId: string, itemId: string) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, heuristicItems: p.heuristicItems.filter((h) => h.id !== itemId) }
          : p
      )
    );
  };

  const addJourneyStage = (
    projectId: string,
    stage: Omit<JourneyTouchpoint, 'id' | 'authorId' | 'authorName'>
  ) => {
    const newStage: JourneyTouchpoint = {
      ...stage,
      id: 'j_' + Math.random().toString(36).substring(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, journeyStages: [...p.journeyStages, newStage], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  const deleteJourneyStage = (projectId: string, stageId: string) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, journeyStages: p.journeyStages.filter((s) => s.id !== stageId) }
          : p
      )
    );
  };

  const addSusResponse = (
    projectId: string,
    respondentName: string,
    respondentRole: string,
    answers: number[],
    openFeedback?: string
  ) => {
    const { score } = calculateSusScore(answers);
    const newEntry = {
      id: 'sus_' + Math.random().toString(36).substring(2, 9),
      respondentName,
      respondentRole,
      answers,
      susScore: score,
      openFeedback,
      submittedAt: new Date().toISOString(),
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, susRespondents: [newEntry, ...p.susRespondents], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  const updateWcagItem = (
    projectId: string,
    criterionId: string,
    partial: Partial<WcagCriterion>
  ) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              wcagItems: p.wcagItems.map((w) =>
                w.id === criterionId ? { ...w, ...partial } : w
              ),
              updatedAt: 'Ahora',
            }
          : p
      )
    );
  };

  const addImpactEffortItem = (
    projectId: string,
    item: Omit<ImpactEffortItem, 'id' | 'votes' | 'votedUserIds' | 'authorId' | 'authorName'>
  ) => {
    const newItem: ImpactEffortItem = {
      ...item,
      id: 'ie_' + Math.random().toString(36).substring(2, 9),
      votes: 1,
      votedUserIds: [currentUser.id],
      authorId: currentUser.id,
      authorName: currentUser.name,
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, impactEffortItems: [newItem, ...p.impactEffortItems], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  const voteImpactEffortItem = (projectId: string, itemId: string) => {
    setAllProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          impactEffortItems: p.impactEffortItems.map((it) => {
            if (it.id !== itemId) return it;
            const voted = it.votedUserIds.includes(currentUser.id);
            const nextVoted = voted
              ? it.votedUserIds.filter((id) => id !== currentUser.id)
              : [...it.votedUserIds, currentUser.id];
            return {
              ...it,
              votedUserIds: nextVoted,
              votes: nextVoted.length,
            };
          }),
        };
      })
    );
  };

  const approveFinding = (
    projectId: string,
    finding: Omit<Finding, 'id' | 'authorName' | 'approvedBy' | 'approvedAt'>
  ) => {
    const newFinding: Finding = {
      ...finding,
      id: 'fnd_' + Math.random().toString(36).substring(2, 9),
      authorName: currentUser.name,
      approvedBy: finding.status === 'aprobado' ? currentUser.name : undefined,
      approvedAt:
        finding.status === 'aprobado' ? new Date().toISOString().slice(0, 10) : undefined,
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, findings: [newFinding, ...p.findings], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  const updateFinding = (
    projectId: string,
    findingId: string,
    partial: Partial<Finding>
  ) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              findings: p.findings.map((f) =>
                f.id === findingId
                  ? {
                      ...f,
                      ...partial,
                      approvedBy:
                        partial.status === 'aprobado' ? currentUser.name : f.approvedBy,
                      approvedAt:
                        partial.status === 'aprobado'
                          ? new Date().toISOString().slice(0, 10)
                          : f.approvedAt,
                    }
                  : f
              ),
            }
          : p
      )
    );
  };

  const deleteFinding = (projectId: string, findingId: string) => {
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, findings: p.findings.filter((f) => f.id !== findingId) }
          : p
      )
    );
  };

  const submitSurveyResponse = (
    projectId: string,
    response: Omit<SurveyResponse, 'id' | 'submittedAt'>
  ) => {
    const newResp: SurveyResponse = {
      ...response,
      id: 'sr_' + Math.random().toString(36).substring(2, 9),
      submittedAt: new Date().toISOString(),
    };
    setAllProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, surveyResponses: [newResp, ...p.surveyResponses], updatedAt: 'Ahora' }
          : p
      )
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        members,
        currentUser,
        isAuthenticated,
        detectedClientIp,
        loginWithIp,
        logout,
        projects,
        allProjects,
        currentProject,
        currentProjectId,
        setCurrentProjectId,
        createProject,
        updateProject,
        toggleProjectPermission,
        toggleUserAdmin,
        inviteMember,
        bindIpToUser,
        addIcebergItem,
        deleteIcebergItem,
        addHeuristicItem,
        updateHeuristicItem,
        deleteHeuristicItem,
        addJourneyStage,
        deleteJourneyStage,
        addSusResponse,
        updateWcagItem,
        addImpactEffortItem,
        voteImpactEffortItem,
        approveFinding,
        updateFinding,
        deleteFinding,
        submitSurveyResponse,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
