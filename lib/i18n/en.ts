import type { zh } from './zh'

type DeepWiden<T> = T extends string
  ? string
  : T extends object
    ? { [K in keyof T]: DeepWiden<T[K]> }
    : T

export const en = {
  auth: {
    login: {
      title: 'Login to SoloShip',
      subtitle: 'Choose a way to continue:',
      google: 'Continue with Google',
      github: 'Continue with GitHub',
      emailTab: 'Email login',
      signUpTab: 'Email sign up',
      email: 'Email',
      password: 'Password',
      submitLogin: 'Log in',
      submitSignUp: 'Create account',
      verifyHint: 'We sent a verification email to your inbox. Open the link in that email to finish signing up.',
      signUpFailedGeneric: 'Sign up failed. Please try again later or contact the organizers.',
      googleMissingCredential: 'Google did not return a valid credential. Please try again.',
      googleLoading: 'Google login loading',
      signingIn: 'Signing in...',
      signingUp: 'Creating account...',
      githubRedirecting: 'Redirecting to GitHub...',
      divider: 'or',
      backToHome: 'Back to home',
      applyNotice: {
        title: 'Log in before applying to SoloShip Vol.1',
        body: 'The application flow needs an account to save your progress and admission result. No account yet? Use Google or email below, and you will return to the application form after login.',
      },
      errors: {
        rateLimit: 'Too many emails have been sent. Please try again later, usually after about 60 seconds.',
        rateLimitOAuthHint: 'Tip: you can also continue with Google above and skip email verification.',
        invalidCredentials: 'The email or password is incorrect.',
        userAlreadyRegistered: 'This email is already registered. Please log in instead.',
        weakPassword: 'The password is too weak. Use at least 6 characters with letters and numbers.',
        invalidEmail: 'Please enter a valid email address.',
        emailNotConfirmed: 'This email has not been verified yet. Please check your inbox and confirm it first.',
        network: 'Network error. Please check your connection and try again.',
        generic: 'Login failed. Please try again later.',
      },
    },
    verify: {
      title: 'Verification email sent',
      body: 'A verification link has been sent to your inbox. After you open the link, you will be redirected back here.',
      sentTo: 'Sent to:',
      nextSteps: 'Next steps:',
      step1: 'Open your inbox, including spam or promotions folders',
      step2: 'Click the confirmation link in the email',
      step3: 'SoloShip will reopen and finish signing you in',
      noEmail: 'Did not receive the email?',
      noEmailHint: 'Email usually arrives within 1-2 minutes. If it still does not show up, check spam or return to the login page and continue with Google.',
      backToLogin: 'Back to login',
    },
    errors: {
      invalidCredentials: 'The email or password is incorrect. Please try again.',
      invalidEmail: 'The email format is invalid. Please check it and try again.',
      emailAddressUnsupported: 'This email address is not supported, possibly because of domain restrictions or deliverability issues. Please use another email or continue with Google.',
      userAlreadyRegistered: 'This email is already registered. Please log in instead.',
      weakPassword: 'Password must be at least 6 characters.',
      emailNotConfirmed: 'This email has not been verified yet. Please open the verification link first.',
      rateLimited: 'Verification emails were sent too frequently. Please wait about 60 seconds and try again.',
      signupDisabled: 'Sign ups are currently disabled.',
      oauthFailed: 'Third-party login failed. Please try again later.',
      unknown: 'Login failed. Please try again later.',
    },
  },
  apply: {
    title: 'Apply to SoloShip Vol.1',
    subtitle: 'A 3-week high-pressure shipping sprint. Apply first, pay after admission.',
    form: {
      name: 'Name / English name',
      email: 'Email',
      city: 'City',
      contact: 'Contact method (WeChat or phone)',
      bio: 'One-line intro',
      direction: 'Direction tags (optional)',
      idea: 'Project idea (optional)',
      links: 'Related links (GitHub / Twitter / work, one per line, optional)',
      submit: 'Submit application',
    },
    success: {
      title: 'Application submitted',
      body: 'We will review it within 3 business days and email the result. You can also check your application status anytime.',
    },
    status: {
      title: 'My application status',
      empty: 'You have not submitted an application yet.',
      goApply: 'Apply now',
    },
  },
  common: {
    loading: 'Loading...',
    authLoading: 'Login page loading',
    verifyLoading: 'Verification page loading',
    error: 'Something went wrong. Please try again later.',
  },
} as const satisfies DeepWiden<typeof zh>
