"use client";

import React, { createContext, useContext, useState } from "react";

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
  [GUIDE_STEPS.LANDING]: null,
  [GUIDE_STEPS.GET_TOKEN_BTN]: {
    stepNumber: 1,
    message: "To start, get your token.",
    buttonText: "Get Token",
  },
  [GUIDE_STEPS.GET_TOKEN_FORM]: {
    stepNumber: 2,
    message: "Enter your details to generate token.",
    buttonText: "Generate Token",
  },
  [GUIDE_STEPS.TOKEN_GENERATED]: {
    stepNumber: 3,
    message: "Copy your token and save it.",
    buttonText: "Copy & Continue",
  },
  [GUIDE_STEPS.LOGIN]: {
    stepNumber: 4,
    message: "Login using mobile and token.",
    buttonText: "Login",
  },
  [GUIDE_STEPS.FORM_FILLING]: {
    stepNumber: 5,
    message: "Fill your profile details.",
    buttonText: "Continue Form",
  },
  [GUIDE_STEPS.FINAL_SUBMIT]: {
    stepNumber: 6,
    message: "Submit your profile.",
    buttonText: "Submit",
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
