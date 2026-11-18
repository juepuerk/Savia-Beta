/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Root Application Router & Dark Violet Ambient Shell
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, SearchX } from 'lucide-react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { ToastProvider } from './components/ui/Toast';
import { Header } from './components/Header';
import { BetaNotice } from './components/BetaNotice';
import { IpLoginScreen } from './components/IpLoginScreen';
import { VisionDashboardView } from './components/VisionDashboardView';
import { ProjectList } from './components/ProjectList';
import { ProjectStudio } from './components/ProjectStudio';
import { MethodsCatalogView } from './components/MethodsCatalogView';
import { ReportsGalleryView } from './components/ReportsGalleryView';
import { AdminAccessView } from './components/AdminAccessView';
import { NewProjectModal } from './components/NewProjectModal';
import { AiSynthesisModal } from './components/AiSynthesisModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { ExternalParticipantView } from './components/ExternalParticipantView';
import { EvaluationMethodId } from './types';
import { SectionName, StudioTool, useRoute } from './hooks/useRoute';

const SECTION_TITLES: Record<SectionName, string> = {
  dashboard: 'Panel',
  projects: 'Proyectos',
  methods: 'Métodos',
  reports: 'Informes',
  admin: 'Administración',
};

function getParticipantProjectId(): string | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get('participante') !== 'true') return null;
  return params.get('proyecto') || '';
}

function SaviaAppContent() {
  const { isAuthenticated, currentUser, projects, allProjects, setCurrentProjectId } = useWorkspace();
  const { route, navigate } = useRoute();

  const [showNewProject, setShowNewProject] = useState(false);
  const [preselectedMethod, setPreselectedMethod] = useState<EvaluationMethodId | undefined>(undefined);
  const [showAiModal, setShowAiModal] = useState(false);
  const [reportProjectId, setReportProjectId] = useState<string | null>(null);
  const [participantProjectId, setParticipantProjectId] = useState<string | null>(getParticipantProjectId);

  const routeProjectId = route.name === 'project' ? route.projectId : null;
  const currentProject = routeProjectId ? projects.find((p) => p.id === routeProjectId) ?? null : null;

  // Keep the workspace context in sync with the URL (used by modals and tools).
  useEffect(() => {
    setCurrentProjectId(currentProject ? currentProject.id : null);
  }, [currentProject?.id]);

  // Non-admins cannot stay on the admin section.
  useEffect(() => {
    if (route.name === 'admin' && !currentUser.isAdmin) navigate({ name: 'dashboard' }, { replace: true });
  }, [route.name, currentUser.isAdmin, navigate]);

  // Page title reflects where the user is (browser tabs, history, screen readers).
  useEffect(() => {
    const section = route.name === 'project' ? currentProject?.title ?? 'Proyecto' : SECTION_TITLES[route.name];
    document.title = `${section} · Savia`;
  }, [route.name, currentProject?.title]);

  if (participantProjectId !== null) {
    return (
      <ExternalParticipantView
        projectId={participantProjectId}
        onExit={() => {
          window.history.replaceState(null, '', window.location.pathname + window.location.hash);
          setParticipantProjectId(null);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return <IpLoginScreen />;
  }

  const reportProject = reportProjectId ? allProjects.find((p) => p.id === reportProjectId) || null : null;

  const openProject = (projectId: string, tool?: StudioTool) => navigate({ name: 'project', projectId, tool });

  const openNewProject = (method?: EvaluationMethodId) => {
    setPreselectedMethod(method);
    setShowNewProject(true);
  };

  const activeSection: SectionName = route.name === 'project' ? 'projects' : route.name;

  const renderMain = () => {
    if (route.name === 'project') {
      if (!currentProject) {
        return (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <SearchX className="w-8 h-8 text-[#B892FF] mx-auto" aria-hidden="true" />
            <h1 className="text-lg font-semibold">Proyecto no disponible</h1>
            <p className="text-sm text-[#A89EC9]">
              Este proyecto no existe o tu perfil no tiene acceso a él.
            </p>
            <button
              type="button"
              onClick={() => navigate({ name: 'projects' })}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#1E1638] border border-[#463578] hover:border-[#B892FF] text-[#D8B4FE] rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver mis proyectos
            </button>
          </div>
        );
      }
      return (
        <ProjectStudio
          project={currentProject}
          activeTool={route.tool}
          onChangeTool={(tool) => navigate({ name: 'project', projectId: currentProject.id, tool }, { replace: true })}
          onBack={() => navigate({ name: 'projects' })}
          onOpenAiSynthesis={() => setShowAiModal(true)}
          onOpenReportModal={() => setReportProjectId(currentProject.id)}
          onOpenParticipantPortal={(id) => setParticipantProjectId(id)}
        />
      );
    }

    switch (route.name) {
      case 'admin':
        return currentUser.isAdmin ? <AdminAccessView onEnterProject={(id) => openProject(id)} /> : null;
      case 'projects':
        return <ProjectList onSelectProject={(id) => openProject(id)} onOpenNewProject={() => openNewProject()} />;
      case 'methods':
        return <MethodsCatalogView onStartProjectWithMethod={(methodId) => openNewProject(methodId)} />;
      case 'reports':
        return (
          <ReportsGalleryView
            onOpenProject={(id) => openProject(id)}
            onOpenReport={(id) => setReportProjectId(id)}
          />
        );
      default:
        return (
          <VisionDashboardView
            projects={projects}
            onOpenMethod={(projectId, methodId) => openProject(projectId, methodId)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen relative text-[#F4F1FF]">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:bg-[#FF6B1A] focus:text-[#090616] focus:rounded-lg focus:font-semibold"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('contenido')?.focus();
        }}
      >
        Saltar al contenido
      </a>

      {/* Ambient Blurred Cyan & Magenta Gradations on Dark Violet */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden" aria-hidden="true">
        <div
          className="absolute -top-36 -left-32 w-[540px] h-[540px] rounded-full blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[560px] h-[560px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(217,70,239,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[520px] h-[520px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)' }}
        />
      </div>

      <Header
        activeSection={activeSection}
        onNavigate={(section) => navigate({ name: section })}
        onOpenNewProject={() => openNewProject()}
        onLogout={() => navigate({ name: 'dashboard' }, { replace: true })}
      />

      <BetaNotice />

      <main id="contenido" tabIndex={-1} className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-8 focus:outline-none">
        {renderMain()}
      </main>

      {showNewProject && (
        <NewProjectModal
          initialMethod={preselectedMethod}
          onClose={() => setShowNewProject(false)}
          onCreated={(id) => openProject(id)}
        />
      )}

      {showAiModal && currentProject && (
        <AiSynthesisModal project={currentProject} onClose={() => setShowAiModal(false)} />
      )}

      {reportProject && (
        <ExecutiveReportModal project={reportProject} onClose={() => setReportProjectId(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <SaviaAppContent />
      </WorkspaceProvider>
    </ToastProvider>
  );
}
