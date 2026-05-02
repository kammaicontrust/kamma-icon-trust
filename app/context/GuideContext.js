"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const GuideContext = createContext();

export const GUIDE_STEPS = {
  LANDING: "landing",
  GET_TOKEN_BTN: "get_token_btn",
  GET_TOKEN_FORM: "get_token_form",
  TOKEN_GENERATED: "token_generated",
  LOGIN: "login",
  FORM_FILLING: "form_filling",
  FINAL_SUBMIT: "final_submit",
};

export const GUIDE_CONTENT = {
  [GUIDE_STEPS.LANDING]: {
    message: "Welcome! I'll help you register your marriage profile step by step.",
    actionText: "Start Guide",
    progress: "Step 1/6",
  },
  [GUIDE_STEPS.GET_TOKEN_BTN]: {
    message: "To register, you first need a token. Click on 'Get Token'.",
    targetSelector: '[data-guide="nav-get-token"]',
    progress: "Step 2/6",
  },
  [GUIDE_STEPS.GET_TOKEN_FORM]: {
    message: "Enter your Name, Mobile Number, Email, and Aadhaar last digits.",
    targetSelector: '[data-guide="get-token-form"]',
    progress: "Step 2/6",
  },
  [GUIDE_STEPS.TOKEN_GENERATED]: {
    message: "This is your token. Please copy and save it. You will use it to login.",
    targetSelector: '[data-guide="generated-token"]',
    progress: "Step 3/6",
  },
  [GUIDE_STEPS.LOGIN]: {
    message: "Now enter your mobile number and token to access the registration form.",
    targetSelector: '[data-guide="login-form"]',
    progress: "Step 4/6",
  },
  [GUIDE_STEPS.FORM_FILLING]: {
    message: "Enter your personal details carefully. This will be visible in your profile.",
    targetSelector: '[data-guide="form-fields"]',
    progress: "Step 5/6",
  },
  [GUIDE_STEPS.FINAL_SUBMIT]: {
    message: "Review all details before submitting. Once submitted, your profile will be visible.",
    targetSelector: '[data-guide="submit-btn"]',
    progress: "Step 6/6",
  },
};

export function GuideProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default to true to prevent hydration mismatch
  const [currentStep, setCurrentStep] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem("kit_guide_dismissed") === "true";
    setIsDismissed(dismissed);
    
    const savedStep = localStorage.getItem("kit_guide_step");
    if (savedStep && !dismissed) {
      setCurrentStep(savedStep);
      setIsActive(true);
    }
  }, []);

  // Save state on change
  useEffect(() => {
    if (isDismissed) {
      localStorage.setItem("kit_guide_dismissed", "true");
      setIsActive(false);
    } else {
      localStorage.setItem("kit_guide_dismissed", "false");
    }
  }, [isDismissed]);

  useEffect(() => {
    if (currentStep && isActive && !isDismissed) {
      localStorage.setItem("kit_guide_step", currentStep);
    }
  }, [currentStep, isActive, isDismissed]);

  const startGuide = () => {
    setIsDismissed(false);
    setIsActive(true);
    setCurrentStep(GUIDE_STEPS.GET_TOKEN_BTN);
  };

  const setStep = (step) => {
    if (isDismissed) return;
    setCurrentStep(step);
    if (!isActive) setIsActive(true);
  };

  const dismissGuide = () => {
    setIsDismissed(true);
    setIsActive(false);
    localStorage.setItem("kit_guide_dismissed", "true");
  };

  const value = {
    isActive,
    isDismissed,
    currentStep,
    startGuide,
    setStep,
    dismissGuide,
    content: currentStep ? GUIDE_CONTENT[currentStep] : null,
  };

  return (
    <GuideContext.Provider value={value}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const context = useContext(GuideContext);
  if (!context) {
    throw new Error("useGuide must be used within a GuideProvider");
  }
  return context;
}
