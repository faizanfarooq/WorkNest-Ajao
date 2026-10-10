/**
 * Google Analytics 4 (GA4) Integration for WorkNest Ajao
 * Measurement ID: G-2LRYNT9PQ4
 */

export const GA_MEASUREMENT_ID = 'G-2LRYNT9PQ4';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Send custom pageview to GA4
 */
export function trackPageView(pageTitle?: string, pagePath?: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: pagePath || window.location.pathname + window.location.search,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

/**
 * Track custom interactive event
 */
export function trackEvent(
  action: string,
  params: Record<string, any> = {}
) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      ...params,
      send_to: GA_MEASUREMENT_ID,
    });
  }
}

/**
 * Track tab navigation in WorkNest Ajao SPA
 */
export function trackTabNavigation(tabName: string) {
  trackEvent('navigate_tab', {
    tab_name: tabName,
    page_title: `WorkNest Ajao - ${tabName}`,
  });
  trackPageView(`WorkNest Ajao - ${tabName}`, `/#${tabName}`);
}

/**
 * Track role toggle (Candidate vs Founder)
 */
export function trackRoleSwitch(role: 'candidate' | 'founder') {
  trackEvent('switch_role', {
    user_role: role,
  });
}

/**
 * Track 1-Click Proof-of-Work Project Application
 */
export function trackProjectApplication(params: {
  projectId: string;
  projectTitle: string;
  startupName: string;
  stipendTotal?: string;
}) {
  trackEvent('apply_internship', {
    project_id: params.projectId,
    project_title: params.projectTitle,
    startup_name: params.startupName,
    stipend_total: params.stipendTotal,
    event_category: 'internship_funnel',
  });
}

/**
 * Track AI Skill Verification submission
 */
export function trackAiSkillAudit(params: {
  projectTitle: string;
  language?: string;
  score?: number;
}) {
  trackEvent('ai_skill_audit', {
    project_title: params.projectTitle,
    language: params.language,
    score: params.score,
    event_category: 'ai_verification',
  });
}

/**
 * Track Milestone Approval or Escrow Payout
 */
export function trackMilestoneInteraction(params: {
  milestoneTitle: string;
  actionType: 'submit' | 'approve' | 'release_escrow';
  amountPkr?: number;
}) {
  trackEvent('milestone_interaction', {
    milestone_title: params.milestoneTitle,
    action_type: params.actionType,
    amount_pkr: params.amountPkr,
    event_category: 'escrow_wallet',
  });
}

/**
 * Track Founder Chat conversation
 */
export function trackFounderMessage(founderName: string) {
  trackEvent('send_founder_message', {
    founder_name: founderName,
    event_category: 'direct_chat',
  });
}
