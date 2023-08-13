import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useEmail } from "../contexts/EmailContext";
import React, { useMemo } from "react";
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
  const [items, setItems] = useState<AcronymData[]>([]);
  const [showResults, setShowResults] = useState(true);
  const router = useRouter();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(true);
  const { userEmail } = useEmail();
  const [approvalCount, setApprovalCount] = useState(0);

  useEffect(() => {
    if (!userEmail) {
      router.push("/");
    }
  }, [userEmail, router]);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: "", type: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        setData(result);
        setItems(result);
      });
  }, [approvalCount]);

  useEffect(() => {
    const newFilteredData = data.filter(
      (item) =>
        item.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.by.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setItems(newFilteredData);
  }, [searchTerm, data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    setShowResults(true);
  };

  const handleApprovalAction = async (
    itemId: string,
    action: string,
    status: string
  ) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/wordplay-approval`;
    const params = new URLSearchParams({
      id: itemId,
      action: action,
      status: status,
    });

    try {
      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setToast({
        message: `${action.charAt(0).toUpperCase() + action.slice(1)} success.`,
        type: "success",
      });
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      setToast({ message: "Error during the API call.", type: "error" });
    }
    setApprovalCount((prevCount) => prevCount + 1);
  };

  const togglePendingItems = () => {
    setShowPendingOnly((prevState) => !prevState);
    setApprovalCount((prevCount) => prevCount + 1);
  };

  const sortedItems = React.useMemo(() => {
    if (showResults) {
      if (showPendingOnly) {
        return [...items].sort((a, b) => a.status.localeCompare(b.status));
      } else {
        return [...items].sort((a, b) => a.acronym.localeCompare(b.acronym));
      }
    }
    return [];
  }, [items, showResults, showPendingOnly]);

  const formatStatus = (status: string) => {
    const lines = status.split("\n").map((line) => line.trim());

    if (lines[0] === "pending_add") {
      return ["add", ""];
    }

    if (lines[0] === "pending_delete") {
      const email = lines[1].split(": ")[1];
      return [`delete`, email];
    }

    if (lines[0] === "pending_update") {
      const oldAcronym = lines[1].split(": ")[1];
      const oldFullForm = lines[2].split(": ")[1];
      const newAcronym = lines[3].split(": ")[1];
      const newFullForm = lines[4].split(": ")[1];
      const email = lines[5].split(": ")[1];

      const formattedRequest = `update \n${oldAcronym} to ${newAcronym}\n${oldFullForm} to ${newFullForm}`;
      return [formattedRequest, email];
    }

    return [status, ""];
  };

  const downloadPendingDataAsCSV = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan-pending`
    );
    const data = await response.json();

    const csvContent = data
      .map((item: any) => {
        const [formattedStatus, requestBy] = formatStatus(item.status);
        if (formattedStatus === "add") {
          return [item.acronym, item.abbreviation, formattedStatus, item.by]
            .map((value) => `"${value}"`)
            .join(",");
        } else {
          return [item.acronym, item.abbreviation, formattedStatus, requestBy]
            .map((value) => `"${value}"`)
            .join(",");
        }
      })
      .join("\n");

    const header = "acronym,abbreviation,request,requested_by\n";
    const csvData = new Blob([header + csvContent], { type: "text/csv" });
    const csvUrl = URL.createObjectURL(csvData);

    const downloadLink = document.createElement("a");
    downloadLink.href = csvUrl;
    downloadLink.download = "wordplay-pending-request.csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      {toast.message && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
      <Head>
        <title>WordPlay: Admin</title>
      </Head>

      <label className="switch">
        <input
          type="checkbox"
          checked={showPendingOnly}
          onChange={togglePendingItems}
        />
        <span className="slider round"></span>
      </label>

      <span style={{ paddingLeft: "10px" }}>
        {showPendingOnly ? "Show Pending Only" : "Show All"}
      </span>

      <input
        type="text"
        className="search-input"
        placeholder="Search Acronym, Abbreviation, Email"
        value={searchTerm}
        onChange={handleInputChange}
      />
      {sortedItems.map((item) => {
        if (showPendingOnly) {
          if (!item.status.includes("pending")) {
            return null;
          }
        } else {
          if (item.status.includes("pending")) {
            return null;
          }
        }

        if (item.status.includes("pending_add")) {
          return (
            <div key={item.id} className="info-item">
              <div className="pending">Add</div>
              {item.acronym}: {item.abbreviation} <br />
              Requestor: {item.by} <br />
              <div className="button-group">
                <button
                  onClick={() =>
                    handleApprovalAction(item.id, "approve", item.status)
                  }
                  className="approve-button"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleApprovalAction(item.id, "reject", item.status)
                  }
                  className="reject-button"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        } else if (item.status.includes("pending_delete")) {
          const [statusAction, byPart] = item.status.split("\n");
          const byEmail = byPart.split(": ")[1];
          return (
            <div key={item.id} className="info-item">
              <div className="pending">Delete</div>
              {item.acronym}: {item.abbreviation} <br />
              Requestor: {byEmail} <br />
              <div className="button-group">
                <button
                  onClick={() =>
                    handleApprovalAction(item.id, "approve", item.status)
                  }
                  className="approve-button"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleApprovalAction(item.id, "reject", item.status)
                  }
                  className="reject-button"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        } else if (item.status.includes("pending_update")) {
          const pattern =
            /pending_update\nCurrentAcronym: (?<CurrentAcronym>\S+)\nCurrentAbbreviation: (?<CurrentAbbreviation>.+)\nNewAcronym: (?<NewAcronym>\S+)\nNewAbbreviation: (?<NewAbbreviation>.+)\nBy: (?<ByEmail>.+)/s;
          const match = item.status.match(pattern);

          if (match && match.groups) {
            const oldAcronym = match.groups.CurrentAcronym;
            const newAcronym = match.groups.NewAcronym;
            const oldAbbreviation = match.groups.CurrentAbbreviation.trim();
            const newAbbreviation = match.groups.NewAbbreviation.trim();
            const email = match.groups.ByEmail;

            return (
              <div key={item.id} className="info-item">
                <div className="pending">Update</div>
                {oldAcronym} ⇒ {newAcronym} <br />
                {oldAbbreviation} ⇒ {newAbbreviation} <br />
                Requestor: {email}
                <div className="button-group">
                  <button
                    onClick={() =>
                      handleApprovalAction(item.id, "approve", item.status)
                    }
                    className="approve-button"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleApprovalAction(item.id, "reject", item.status)
                    }
                    className="reject-button"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          }
        } else {
          return (
            <div key={item.id} className="info-item">
              {item.acronym}: {item.abbreviation} <br />
              By: {item.by} <br />
              Status: {item.status}
            </div>
          );
        }
        return null;
      })}

      <div className="manage-button">
        <a onClick={() => downloadPendingDataAsCSV()}>Export Pending Request</a>
      </div>
    </div>
  );
}
