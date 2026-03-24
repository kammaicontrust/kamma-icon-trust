"use client";

import { useState, useEffect } from "react";
import { auth } from "@/app/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function RegisterPage() {

  const [step, setStep] = useState(1);
  const [token, setToken] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [gothram, setGothram] = useState("");
  const [occupation, setOccupation] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");

  const [photoPreview, setPhotoPreview] = useState(null);

  // recaptcha
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  }, []);

  // token verify
  const verifyToken = () => {
    if (token === "123456") {
      setStep(2);
    } else {
      alert("Invalid Token");
    }
  };

  // send otp
  const sendOTP = async () => {
    try {
      const result = await signInWithPhoneNumber(auth, "+91" + mobile, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep(3);
    } catch (e) {
      alert(e.message);
    }
  };

  // verify otp
  const verifyOTP = async () => {
    try {
      await confirmationResult.confirm(otp);
      setStep(4);
    } catch {
      alert("Invalid OTP");
    }
  };

  // dob → age
  const handleDOB = (val) => {
    setDob(val);
    const birth = new Date(val);
    const today = new Date();
    setAge(today.getFullYear() - birth.getFullYear());
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/bg.webp')" }}></div>

      {/* overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* ring animation */}
      <div className="ring"></div>

      {/* card */}
      <div className="relative z-10 w-[380px] p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label className="text-white text-sm">Token</label>
            <input value={token} onChange={(e)=>setToken(e.target.value)} className="input" />
            <button onClick={verifyToken} className="btn-yellow">Continue</button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label className="text-white text-sm">Mobile</label>
            <div className="flex">
              <span className="prefix">+91</span>
              <input value={mobile} onChange={(e)=>setMobile(e.target.value)} className="input no-left" />
            </div>
            <button onClick={sendOTP} className="btn-green">Send OTP</button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <label className="text-white text-sm">OTP</label>
            <input value={otp} onChange={(e)=>setOtp(e.target.value)} className="input" />
            <button onClick={verifyOTP} className="btn-blue">Verify</button>
          </>
        )}

        {/* STEP 4 FORM */}
        {step === 4 && (
          <div className="space-y-2 text-white">

            <input placeholder="Name" onChange={(e)=>setName(e.target.value)} className="input"/>
            <input placeholder="Village" onChange={(e)=>setVillage(e.target.value)} className="input"/>
            <input placeholder="Gothram" onChange={(e)=>setGothram(e.target.value)} className="input"/>
            <input placeholder="Occupation" onChange={(e)=>setOccupation(e.target.value)} className="input"/>
            <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} className="input"/>

            <input type="date" onChange={(e)=>handleDOB(e.target.value)} className="input"/>
            <input value={age} disabled className="input bg-gray-200"/>

            <input type="file" onChange={(e)=>setPhotoPreview(URL.createObjectURL(e.target.files[0]))} className="input"/>

            <button onClick={()=>setStep(5)} className="btn-pink">Preview</button>
          </div>
        )}

        {/* STEP 5 PREVIEW */}
        {step === 5 && (
          <div className="text-white text-center">
            <h3 className="mb-2">Preview</h3>

            {photoPreview && (
              <img src={photoPreview} className="w-20 h-20 rounded-full mx-auto mb-2"/>
            )}

            <p>{name}</p>
            <p>{village}</p>
            <p>{gothram}</p>
            <p>{occupation}</p>
            <p>{email}</p>
            <p>{age}</p>

            <button className="btn-green mt-2">Submit</button>
          </div>
        )}

      </div>

      <div id="recaptcha-container"></div>

      {/* styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          margin-top: 6px;
          background: white;
          color: black;
        }

        .prefix {
          background: white;
          padding: 10px;
          border-radius: 10px 0 0 10px;
          color: black;
        }

        .no-left {
          border-radius: 0 10px 10px 0;
        }

        .btn-yellow {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: #facc15;
          border-radius: 10px;
        }

        .btn-green {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: #22c55e;
          color: white;
          border-radius: 10px;
        }

        .btn-blue {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: #3b82f6;
          color: white;
          border-radius: 10px;
        }

        .btn-pink {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: #ec4899;
          color: white;
          border-radius: 10px;
        }

        /* ring */
        .ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border: 4px solid gold;
          border-radius: 50%;
          top: 15%;
          left: 10%;
          animation: float 4s infinite ease-in-out;
          box-shadow: 0 0 20px gold;
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
      `}</style>

    </div>
  );
}