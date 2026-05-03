"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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
    stepLabel: "Step 1",
    message: "To start, generate your token.",
    barStep: 1,
  },
  [GUIDE_STEPS.GET_TOKEN_BTN]: {
    stepLabel: "Step 1",
    message: "To start, generate your token.",
    barStep: 1,
  },
  [GUIDE_STEPS.GET_TOKEN_FORM]: {
    stepLabel: "Step 2",
    message: "Enter your details to get token.",
    barStep: 1,
  },
  [GUIDE_STEPS.TOKEN_GENERATED]: {
    stepLabel: "Step 3",
    message: "Copy and save your token.",
    barStep: 1,
  },
  [GUIDE_STEPS.LOGIN]: {
    stepLabel: "Step 4",
    message: "Login using mobile and token.",
    barStep: 2,
  },
  [GUIDE_STEPS.FORM_FILLING]: {
    stepLabel: "Step 5",
    message: "Fill your profile details carefully.",
    barStep: 3,
  },
  [GUIDE_STEPS.FINAL_SUBMIT]: {
    stepLabel: "Step 6",
    message: "Submit your application.",
    barStep: 4,
  },
};

export function GuideProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(null);

  const setStep = (step) => {
    setCurrentStep(step);
  };

  const value = {
    currentStep,
    setStep,
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
