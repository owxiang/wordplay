import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useEmail } from "../contexts/EmailContext";
import Head from "next/head";

type AcronymData = {
  datetime: string;
  acronym: string;
  status: string;
  by: string;
  abbreviation: string;
  id: string;
};

export default function Page() {
  const [data, setData] = useState<AcronymData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<AcronymData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isUserLoginModalOpen, setisUserLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const { setUserEmail } = useEmail();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isAdminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState<string>("");

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: "", type: "" });
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan-pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        setPendingCount(result.length);
      });
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan-approved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => setData(result));
  }, []);

  useEffect(() => {
    setFilteredData(
      data.filter(
        (item) =>
          item.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (
      !email.includes("@") ||
      !email.split("@")[0] ||
      !email.endsWith("@defence.gov.sg")
    ) {
      setToast({
        message: "Please enter a valid @defence.gov.sg email address.",
        type: "error",
      });

      return;
    }

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/wordplay-otp?email=${encodeURIComponent(email)}&otp=none`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.status === 200) {
        setOtpSent(true);
        setToast({
          message: "An OTP has been sent to your email address.",
          type: "success",
        });
      } else {
        setToast({
          message: "Error sending OTP. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      setToast({
        message: "There was an error. Please try again.",
        type: "error",
      });
    }
  };

  const handleOtpVerification = async () => {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/wordplay-otp?email=${encodeURIComponent(
        email
      )}&otp=${encodeURIComponent(otp)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      setUserEmail(email);
      setisUserLoginModalOpen(false);
      router.push("/manage");
    } else {
      setToast({
        message: "Invalid or expired OTP. Please try again.",
        type: "error",
      });
    }
  };

  const handleAdminLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wordplay-admin-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: adminPassword }),
        }
      );

      const data = await response.json();
      if (data.message === "Authenticated") {
        setAdminLoginModalOpen(false);
        setUserEmail("admin");
        router.push("/admin");
      } else {
        setToast({ message: "Wrong password. Try again.", type: "error" });
      }
    } catch (error) {
      setToast({
        message: "There was an error. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div>
      {toast.message && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
      <Head>
        <title>WordPlay: Home</title>
      </Head>

      <input
        type="text"
        className="search-input"
        placeholder="Search by Acronym or Abbreviation"
        value={searchTerm}
        onChange={handleInputChange}
      />

      {showResults &&
        filteredData.map((item) => (
          <div key={item.id} className="info-item">
            <strong>{item.acronym}</strong> ({item.abbreviation})
          </div>
        ))}

      <div className="manage-button">
        <a
          onClick={() => {
            setisUserLoginModalOpen(true);
            setEmail("@defence.gov.sg");
            setOtp("");
          }}
        >
          User Portal
        </a>
      </div>

      <div className="manage-button">
        <a onClick={() => setAdminLoginModalOpen(true)}>
          Admin Portal
          {pendingCount > 0 && (
            <span className="notification-bubble">{pendingCount}</span>
          )}
        </a>
      </div>

      {isUserLoginModalOpen && (
        <div className="modal-fields-container">
          <div className="modal-content">
            <h2>User Portal Authentication</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Enter OTP"
              value={otp}
              disabled={!otpSent}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="modal-buttons">
              {!otpSent ? (
                <button
                  onClick={handleEmailSubmit}
                  className="modal-submit-button"
                >
                  Get OTP
                </button>
              ) : (
                <button
                  onClick={handleOtpVerification}
                  className="modal-submit-button"
                >
                  Verify OTP
                </button>
              )}
              <button
                onClick={() => setisUserLoginModalOpen(false)}
                className="modal-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdminLoginModalOpen && (
        <div className="modal-fields-container">
          <div className="modal-content">
            <h2>Admin Portal Authentication</h2>
            <input
              type="password"
              placeholder="Enter Password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button
                onClick={handleAdminLogin}
                className="modal-submit-button"
              >
                Login
              </button>
              <button
                onClick={() => setAdminLoginModalOpen(false)}
                className="modal-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
