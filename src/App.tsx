/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Savia - Root Application Router & Dark Violet Ambient Shell
 */

import React, { useEffect, useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header, NavTab } from './components/Header';
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

function SaviaAppContent() {
  const {
    isAuthenticated,
    currentUser,
    projects,
    currentProject,
    setCurrentProjectId,
    allProjects,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [studioInitialTool, setStudioInitialTool] = useState<EvaluationMethodId | 'summary' | undefined>(undefined);
  const [showNewProject, setShowNewProject] = useState(false);
  const [preselectedMethod, setPreselectedMethod] = useState<EvaluationMethodId | undefined>(
    undefined
  );
  const [showAiModal, setShowAiModal] = useState(false);
  const [reportProjectId, setReportProjectId] = useState<string | null>(null);
  const [participantProjectId, setParticipantProjectId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('participante') === 'true') {
      return params.get('proyecto') || 'proj_fn_01';
    }
    return null;
  });

  useEffect(() => {
    if (activeTab === 'admin' && !currentUser.isAdmin) {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser.isAdmin]);

  if (participantProjectId) {
    return (
      <ExternalParticipantView
        projectId={participantProjectId}
        onExit={() => setParticipantProjectId(null)}
      />
    );
  }

  if (!isAuthenticated) {
    return <IpLoginScreen />;
  }

  const reportProject =
    reportProjectId ? allProjects.find((p) => p.id === reportProjectId) || null : null;

  const openProjectAt = (projectId: string, tool?: EvaluationMethodId | 'summary') => {
    setStudioInitialTool(tool);
    setCurrentProjectId(projectId);
  };

  return (
    <div className="min-h-screen relative text-[#F4F1FF]">
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
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setStudioInitialTool(undefined);
          setActiveTab(tab);
        }}
        onOpenNewProject={() => {
          setPreselectedMethod(undefined);
          setShowNewProject(true);
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentProject ? (
          <ProjectStudio
            key={currentProject.id + (studioInitialTool || '')}
            project={currentProject}
            initialTool={studioInitialTool}
            onBack={() => {
              setStudioInitialTool(undefined);
              setCurrentProjectId(null);
            }}
            onOpenAiSynthesis={() => setShowAiModal(true)}
            onOpenReportModal={() => setReportProjectId(currentProject.id)}
            onOpenParticipantPortal={(id) => setParticipantProjectId(id)}
          />
        ) : activeTab === 'admin' && currentUser.isAdmin ? (
          <AdminAccessView
            onEnterProject={(id) => openProjectAt(id)}
          />
        ) : activeTab === 'projects' ? (
          <ProjectList
            onSelectProject={(id) => openProjectAt(id)}
            onOpenNewProject={() => {
              setPreselectedMethod(undefined);
              setShowNewProject(true);
            }}
          />
        ) : activeTab === 'methods' ? (
          <MethodsCatalogView
            onStartProjectWithMethod={(methodId) => {
              setPreselectedMethod(methodId);
              setShowNewProject(true);
            }}
          />
        ) : activeTab === 'reports' ? (
          <ReportsGalleryView
            onOpenProject={(id) => openProjectAt(id)}
            onOpenReport={(id) => setReportProjectId(id)}
          />
        ) : (
          <VisionDashboardView
            projects={projects}
            onOpenMethod={(projectId, methodId) => openProjectAt(projectId, methodId)}
          />
        )}
      </main>

      {showNewProject && (
        <NewProjectModal
          initialMethod={preselectedMethod}
          onClose={() => setShowNewProject(false)}
          onCreated={(id) => openProjectAt(id)}
        />
      )}

      {showAiModal && currentProject && (
        <AiSynthesisModal
          project={currentProject}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {reportProject && (
        <ExecutiveReportModal
          project={reportProject}
          onClose={() => setReportProjectId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <SaviaAppContent />
    </WorkspaceProvider>
  );
}
