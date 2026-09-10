import React, { useState, useMemo } from 'react';
import { filterEligibleJobs } from './services/jobMatchingPipeline';
import { useApp } from './store/AppContext';
import { AuthFlow } from './screens/auth/AuthFlow';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { FloatingMojoAssistant } from './components/mojo/FloatingMojoAssistant';

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
import { WorkerProfileModal } from './components/workers/WorkerProfileModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Shared Screens & Modals
import { PaymentsView } from './screens/shared/PaymentsView';
import { NotificationsView } from './screens/shared/NotificationsView';
import { ProfileAndSettingsView } from './screens/shared/ProfileAndSettingsView';
import { RatingModal } from './components/common/RatingModal';
import { SOSModal, ReportModal, BlockModal } from './components/common/SafetyModals';
import { Job, User } from './types';

export const App: React.FC = () => {
  const {
    user,
    isAuthenticated,
    onboardingStep,
    activeRole,
    activeScreen,
    setActiveScreen,
    jobs,
    allWorkers,
    inviteWorkerToJob,
    confirmWorkerForJob,
    pendingRatingJob,
    setPendingRatingJob,
    theme,
    filters,
  } = useApp();

  const eligibleJobsCount = useMemo(() => {
    return filterEligibleJobs(jobs, filters, user).length;
  }, [jobs, filters, user]);

  // Modals & Navigation states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [confirmedJob, setConfirmedJob] = useState<Job | null>(null);
  const [selectedProfileWorker, setSelectedProfileWorker] = useState<User | null>(null);
  const [directoryCategory, setDirectoryCategory] = useState<string | undefined>('All');
  const [directorySearch, setDirectorySearch] = useState<string | undefined>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  const handleOpenDirectoryWithCategory = (cat?: string, search?: string) => {
    setDirectoryCategory(cat || 'All');
    setDirectorySearch(search || '');
    setActiveScreen('directory');
  };

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

  // If user is undergoing onboarding or not authenticated or KYC incomplete, render AuthFlow
  if (!isAuthenticated || !user.kycVerified || onboardingStep !== 'app') {
    return <AuthFlow />;
  }

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col items-center bg-[#F7F9FC] text-[#111827]">
      {/* Mobile-Frame Canvas Wrapper */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative shadow-xl overflow-x-hidden bg-white text-[#111827] border-x border-[#E2E8F0]">
        {/* Persistent Top Header */}
        <Header />

        {/* Dynamic Screen Routing */}
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary
            fallbackTitle="Screen View Error"
            fallbackMessage="This view encountered an unexpected issue. Your data and balance are completely safe."
            onReset={() => setActiveScreen('home')}
          >
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
                    onOpenDirectory={() => handleOpenDirectoryWithCategory('All')}
                  />
                )}

                {activeScreen === 'my_jobs' && (
                  <CustomerOngoingJobView
                    onOpenRating={job => setPendingRatingJob(job)}
                  />
                )}
              </>
            )}

            {/* Shared Across Both Roles (Never a blank screen) */}
            {activeScreen === 'directory' && (
              <WorkerDirectory
                workers={allWorkers}
                initialCategory={directoryCategory}
                initialSearch={directorySearch}
                postedJobs={jobs.filter(j => j.status !== 'Finished')}
                onInviteWorker={(workerId, jobId) => inviteWorkerToJob(workerId, jobId)}
                onSelectWorker={worker => setSelectedProfileWorker(worker)}
                onBack={() => setActiveScreen('home')}
              />
            )}

            {activeScreen === 'applicants' && (
              <CustomerApplicantsView
                initialJobId={selectedJob?.id}
                onSelectWorker={worker => setSelectedProfileWorker(worker)}
              />
            )}

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
          </ErrorBoundary>
        </main>

        {/* Floating Mojo AI Assistant (Not a bottom nav tab!) */}
        <FloatingMojoAssistant onOpenDirectoryWithCategory={handleOpenDirectoryWithCategory} />

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
          totalFilteredCount={eligibleJobsCount}
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

        {/* 10. Dedicated Worker Profile Modal */}
        {selectedProfileWorker && (
          <WorkerProfileModal
            worker={selectedProfileWorker}
            jobContext={selectedJob}
            onClose={() => setSelectedProfileWorker(null)}
            onHire={worker => {
              if (selectedJob) {
                confirmWorkerForJob(selectedJob.id, worker.id);
              }
              setSelectedProfileWorker(null);
            }}
            onInvite={worker => {
              const targetJob = selectedJob || jobs.find(j => j.status !== 'Finished');
              if (targetJob) {
                inviteWorkerToJob(worker.id, targetJob.id);
              }
              setSelectedProfileWorker(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
