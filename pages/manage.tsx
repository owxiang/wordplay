import React, { useState, useEffect } from "react";
import { useEmail } from "../contexts/EmailContext";
import { useRouter } from "next/router";
import Head from "next/head";

type AcronymData = {
  datetime: string;
  acronym: string;
  status: string;
  by: string;
  abbreviation: string;
  id: string;
};

export default function ManagePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<AcronymData[]>([]);
  const [items, setItems] = useState<AcronymData[]>([]);
  const [itemsAll, setItemsAll] = useState<AcronymData[]>([]);
  const [isUpdateModalOpen, setisUpdateModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<AcronymData | null>(null);
  const [originalItem, setOriginalItem] = useState<AcronymData | null>(null);
  const initialEntries = [
    {
      acronym: "",
      abbreviation: "",
    },
  ];
  const [entries, setEntries] = useState(initialEntries);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const anyFieldEmpty = entries.some(
    (entry) => !entry.acronym || !entry.abbreviation
  );
  const { userEmail } = useEmail();
  const router = useRouter();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan-approved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => setItems(result));
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => setItemsAll(result));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan-approved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => setItems(result));
  }, [isAddModalOpen, isUpdateModalOpen]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredItems(
        items.filter(
          (item) =>
            item.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, items]);

  const handleDelete = async (itemId: string) => {
    const userConfirmation = window.confirm(
      "Are you sure you wish to submit a deletion request for this item?"
    );

    if (userConfirmation) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/wordplay-delete?id=${itemId}&status=pending_delete-by-${userEmail}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        if (response.status === 200) {
          setToast({
            message: "Deletion request has been successfully submitted.",
            type: "success",
          });
          setItems((prevItems) =>
            prevItems.filter((item) => item.id !== itemId)
          );
        } else {
          setToast({
            message:
              "There was an error processing your request. Please try again.",
            type: "error",
          });
        }
      } catch (error) {
        setToast({
          message:
            "There was an error connecting to the server. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleUpdate = (item: AcronymData) => {
    setOriginalItem(item);
    setCurrentItem(item);
    setisUpdateModalOpen(true);
  };

  const handleModalUpdate = () => {
    if (
      originalItem!.acronym !== currentItem?.acronym ||
      originalItem!.abbreviation !== currentItem?.abbreviation
    ) {
      const duplicate = itemsAll.find(
        (item) =>
          item.acronym === currentItem!.acronym &&
          item.abbreviation === currentItem!.abbreviation
      );

      if (duplicate) {
        if (duplicate.status === "approved") {
          setToast({
            message: `${currentItem!.acronym} and ${
              currentItem!.abbreviation
            } already exists.`,
            type: "error",
          });
          return;
        } else if (duplicate.status.includes("pending")) {
          setToast({
            message: `${currentItem!.acronym} and ${
              currentItem!.abbreviation
            } already exists as pending.`,
            type: "error",
          });
          return;
        }
      }
      const status = `pending_update-${originalItem!.acronym}-to-${
        currentItem?.acronym
      }-and-${originalItem!.abbreviation}-to-${
        currentItem?.abbreviation
      }-by-${userEmail}`;
      const updatedItem = {
        ...currentItem!,
        status: status,
      };
      handleUpdateSubmit(updatedItem.id, updatedItem);
      setisUpdateModalOpen(false);
      setOriginalItem(null);
    } else {
      setToast({ message: "No changes made.", type: "info" });
    }
  };

  const handleUpdateSubmit = async (
    itemId: string,
    updatedItem: AcronymData
  ) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/wordplay-update?id=${itemId}&status=${encodeURIComponent(
          updatedItem.status
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedItem),
        }
      );

      const result = await response.json();

      if (response.status === 200) {
        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        setToast({
          message: "Update request has been successfully submitted.",
          type: "success",
        });
      } else {
        setToast({ message: "Error updating the item.", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Error updating the item.", type: "error" });
    }
  };

  const handleAddField = () => {
    setEntries((prevEntries) => [
      ...prevEntries,
      { acronym: "", abbreviation: "" },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleInputChange = (
    index: number,
    field: "acronym" | "abbreviation",
    value: string
  ) => {
    const updatedEntries = [...entries];
    updatedEntries[index][field] = value;
    setEntries(updatedEntries);
  };

  const handleSubmit = async () => {
    const BASE_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/wordplay-add`;
    let localErrorMessages = [];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      const duplicate = itemsAll.find(
        (item) =>
          item.acronym === entry.acronym &&
          item.abbreviation === entry.abbreviation
      );

      if (duplicate) {
        if (duplicate.status === "approved") {
          localErrorMessages.push(
            `${entry.acronym} and ${entry.abbreviation} already exists.`
          );
          continue;
        } else if (duplicate.status.includes("pending")) {
          localErrorMessages.push(
            `${entry.acronym} and ${entry.abbreviation} already exists as pending.`
          );
          continue;
        }
      }

      const duplicateInEntries = entries.find(
        (e, idx) =>
          e.acronym === entry.acronym &&
          e.abbreviation === entry.abbreviation &&
          idx !== i
      );

      if (duplicateInEntries) {
        const errorMessage = `${entry.acronym} and ${entry.abbreviation} have been entered more than once.`;
        if (!localErrorMessages.some((msg) => msg === errorMessage)) {
          localErrorMessages.push(errorMessage);
        }
      }
    }

    if (localErrorMessages.length > 0) {
      setToast({
        message: localErrorMessages.join("\n"),
        type: "error",
      });
      return;
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const endpointWithParams = `${BASE_API_ENDPOINT}?acronym=${entry.acronym}&abbreviation=${entry.abbreviation}&email=${userEmail}`;

      try {
        const response = await fetch(endpointWithParams, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 200) {
          setToast({
            message:
              "There was an error processing your request. Please try again.",
            type: "error",
          });
          return;
        }
      } catch (error) {
        setToast({
          message:
            "There was an error processing your request. Please try again.",
          type: "error",
        });
        return;
      }
    }
    setToast({
      message: "All items have been successfully submitted.",
      type: "success",
    });
    setIsAddModalOpen(false);
  };

  return (
    <div>
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message.split("\n").map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}

      <Head>
        <title>WordPlay: User</title>
      </Head>

      <input
        type="text"
        className="search-input"
        placeholder="Search by Acronym or Abbreviation"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isUpdateModalOpen && currentItem && (
        <div className="modal-overlay">
          <div className="info-item modal-content">
            Acronym
            <input
              className="search-input"
              type="text"
              defaultValue={currentItem.acronym}
              onChange={(e) =>
                setCurrentItem((prev) => ({
                  ...prev!,
                  acronym: e.target.value,
                }))
              }
            />
            Abbreviation
            <input
              className="search-input"
              type="text"
              defaultValue={currentItem.abbreviation}
              onChange={(e) =>
                setCurrentItem((prev) => ({
                  ...prev!,
                  abbreviation: e.target.value,
                }))
              }
            />
            <div>
              <button
                onClick={handleModalUpdate}
                className="action-button update-button"
              >
                Update
              </button>
              <button
                onClick={() => setisUpdateModalOpen(false)}
                className="action-button cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredItems.map((item) => (
        <div key={item.id} className="info-item">
          <div>
            <strong>{item.acronym}</strong> ({item.abbreviation})
          </div>

          <div>
            <button
              onClick={() => handleUpdate(item)}
              className="action-button update-button"
            >
              Update
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="action-button delete-button"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="add-button">
        <a
          onClick={() => {
            setIsAddModalOpen(true);
            setEntries([...initialEntries]);
            setErrorMessages([]);
          }}
        >
          Add
        </a>
      </div>

      <div>
        {isAddModalOpen && (
          <div className="modal-fields-container">
            {entries.map((entry, index) => (
              <div key={index}>
                <input
                  placeholder="Acronym"
                  value={entry.acronym}
                  onChange={(e) =>
                    handleInputChange(index, "acronym", e.target.value)
                  }
                />
                <input
                  placeholder="Abbreviation"
                  value={entry.abbreviation}
                  onChange={(e) =>
                    handleInputChange(index, "abbreviation", e.target.value)
                  }
                />
                {entries.length > 1 && (
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="modal-remove-button"
                  >
                    -
                  </button>
                )}
                <button onClick={handleAddField} className="modal-add-button">
                  +
                </button>
              </div>
            ))}

            <div className="modal-buttons">
              <button
                onClick={handleSubmit}
                disabled={anyFieldEmpty}
                className="modal-submit-button"
              >
                Submit
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="modal-cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
