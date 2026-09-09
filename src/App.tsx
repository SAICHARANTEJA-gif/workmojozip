import React, { useState } from 'react';
import { useApp } from './store/AppContext';
import { AuthFlow } from './screens/auth/AuthFlow';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { FloatingMojoAssistant } from './components/mojo/FloatingMojoAssistant';
import { DemoControlPanel } from './components/demo/DemoControlPanel';

// Worker Screens
import { WorkerHome } from './screens/worker/WorkerHome';
import { WorkerJobs } from './screens/worker/WorkerJobs';
import { WorkerMyJobs } from './screens/worker/WorkerMyJobs';
import { WorkerFiltersSheet } from './screens/worker/WorkerFiltersSheet';
import { WorkerPreferencesModal } from './screens/worker/WorkerPreferencesModal';
import { JobAlertsModal } from './screens/worker/JobAlertsModal';
import { JobDetailsModal } from './screens/worker/JobDetailsModal';
import { ConfirmedJobView } from './screens/worker/ConfirmedJobView';

// Customer Screens
import { CustomerHome } from './screens/customer/CustomerHome';
import { PostJobWizard } from './screens/customer/PostJobWizard';
import { CustomerApplicantsView } from './screens/customer/CustomerApplicantsView';
import { CustomerOngoingJobView } from './screens/customer/CustomerOngoingJobView';
import { WorkerDirectory } from './components/workers/WorkerDirectory';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';

// Shared Screens & Modals
import { PaymentsView } from './screens/shared/PaymentsView';
import { NotificationsView } from './screens/shared/NotificationsView';
import { ProfileAndSettingsView } from './screens/shared/ProfileAndSettingsView';
import { RatingModal } from './components/common/RatingModal';
import { SOSModal, ReportModal, BlockModal } from './components/common/SafetyModals';
import { Job } from './types';

export const App: React.FC = () => {
  const {
    isAuthenticated,
    onboardingStep,
    activeRole,
    activeScreen,
    setActiveScreen,
    jobs,
    allWorkers,
    inviteWorkerToJob,
    pendingRatingJob,
    setPendingRatingJob,
    theme,
  } = useApp();

  // Modals & Navigation states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [confirmedJob, setConfirmedJob] = useState<Job | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  // Handle Confirmed Job direct navigation
  const handleOpenConfirmedJob = (job: Job) => {
    setConfirmedJob(job);
    setActiveScreen('confirmed_job');
  };

  const handleOpenApplicants = (jobOrJobId?: Job | string) => {
    if (typeof jobOrJobId === 'string') {
      const found = jobs.find(j => j.id === jobOrJobId);
      if (found) setSelectedJob(found);
    } else if (jobOrJobId) {
      setSelectedJob(jobOrJobId);
    }
    setActiveScreen('applicants');
  };

  // If user is undergoing onboarding or not authenticated, render AuthFlow
  if (!isAuthenticated || onboardingStep !== 'app') {
    return <AuthFlow />;
  }

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col items-center bg-[#F7F9FC] text-[#111827]">
      {/* Mobile-Frame Canvas Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-xl overflow-x-hidden bg-white text-[#111827] border-x border-[#E2E8F0]">
        {/* Persistent Top Header */}
        <Header />

        {/* SIH Judge Demo Control Panel Trigger */}
        <DemoControlPanel />

        {/* Dynamic Screen Routing */}
        <main className="flex-1 overflow-y-auto">
          {activeRole === 'worker' ? (
            <>
              {activeScreen === 'home' && (
                <WorkerHome
                  onSelectJob={job => setSelectedJob(job)}
                  onOpenPreferences={() => setIsPreferencesOpen(true)}
                  onOpenAlerts={() => setIsAlertsOpen(true)}
                  onOpenFilters={() => setIsFilterOpen(true)}
                />
              )}

              {activeScreen === 'jobs' && (
                <WorkerJobs
                  onSelectJob={job => setSelectedJob(job)}
                  onOpenFilters={() => setIsFilterOpen(true)}
                />
              )}

              {activeScreen === 'my_jobs' && (
                <WorkerMyJobs
                  onSelectJob={job => setSelectedJob(job)}
                  onOpenConfirmedJob={handleOpenConfirmedJob}
                />
              )}

              {activeScreen === 'confirmed_job' && (
                <ConfirmedJobView
                  job={confirmedJob || jobs[0]}
                  onBack={() => setActiveScreen('my_jobs')}
                  onOpenSOS={() => setIsSOSOpen(true)}
                  onOpenReport={() => setIsReportOpen(true)}
                  onOpenBlock={() => setIsBlockOpen(true)}
                />
              )}
            </>
          ) : (
            /* Customer Mode */
            <>
              {activeScreen === 'home' && (
                <CustomerHome
                  onPostJob={() => setIsPostJobOpen(true)}
                  onOpenJob={job => setSelectedJob(job)}
                  onOpenApplicants={handleOpenApplicants}
                  onOpenDirectory={() => setActiveScreen('directory')}
                />
              )}

              {activeScreen === 'directory' && (
                <WorkerDirectory
                  workers={allWorkers}
                  postedJobs={jobs.filter(j => j.status !== 'Finished')}
                  onInviteWorker={(workerId, jobId) => inviteWorkerToJob(workerId, jobId)}
                  onBack={() => setActiveScreen('home')}
                />
              )}

              {activeScreen === 'my_jobs' && (
                <CustomerOngoingJobView
                  onOpenRating={job => setPendingRatingJob(job)}
                />
              )}

              {activeScreen === 'applicants' && (
                <CustomerApplicantsView />
              )}
            </>
          )}

          {/* Shared Across Both Roles */}
          {activeScreen === 'payments' && <PaymentsView />}

          {activeScreen === 'notifications' && (
            <NotificationsView
              onOpenJob={job => setSelectedJob(job)}
              onOpenConfirmedJob={handleOpenConfirmedJob}
              onOpenApplicants={handleOpenApplicants}
              onOpenRating={job => setPendingRatingJob(job)}
            />
          )}

          {activeScreen === 'profile' && <ProfileAndSettingsView />}
        </main>

        {/* Floating Mojo AI Assistant (Not a bottom nav tab!) */}
        <FloatingMojoAssistant />

        {/* Bottom Navigation */}
        <BottomNav />

        {/* --- GLOBAL POPUPS & MODALS --- */}
        {/* 1. Job Details Modal */}
        {selectedJob && (
          <JobDetailsModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onOpenConfirmed={handleOpenConfirmedJob}
          />
        )}

        {/* 2. Worker Filters Bottom Sheet */}
        <WorkerFiltersSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          totalFilteredCount={jobs.length}
        />

        {/* 3. Worker Preferences Modal */}
        <WorkerPreferencesModal
          isOpen={isPreferencesOpen}
          onClose={() => setIsPreferencesOpen(false)}
        />

        {/* 4. Custom Job Alerts Modal */}
        <JobAlertsModal
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
        />

        {/* 5. Post Job Wizard (Customer) */}
        {isPostJobOpen && (
          <PostJobWizard
            onClose={() => setIsPostJobOpen(false)}
            onJobCreated={newJob => {
              setIsPostJobOpen(false);
              setSelectedJob(newJob);
            }}
          />
        )}

        {/* 6. Mutual Rating Modal (Fires on Shift Finished) */}
        {pendingRatingJob && (
          <RatingModal
            job={pendingRatingJob}
            onClose={() => setPendingRatingJob(null)}
          />
        )}

        {/* 7. Safety: SOS Emergency Modal */}
        {isSOSOpen && (
          <SOSModal
            job={confirmedJob || jobs[0]}
            onClose={() => setIsSOSOpen(false)}
          />
        )}

        {/* 8. Safety: Report Problem Modal */}
        {isReportOpen && (
          <ReportModal
            jobId={confirmedJob?.id}
            onClose={() => setIsReportOpen(false)}
          />
        )}

        {/* 9. Safety: Block User Modal */}
        {isBlockOpen && (
          <BlockModal
            targetName={confirmedJob?.customerName || 'Customer'}
            onClose={() => setIsBlockOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
