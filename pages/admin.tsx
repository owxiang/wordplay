import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useEmail } from '../contexts/EmailContext';
import React, { useMemo } from 'react';
import Head from 'next/head';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [items, setItems] = useState<AcronymData[]>([]);
  const [showResults, setShowResults] = useState(true); 
  const router = useRouter();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(true);
  const { userEmail } = useEmail();

  useEffect(() => {
    if (!userEmail) {
      router.push('/'); 
    }
  }, [userEmail, router]);


  useEffect(() => {
    if (toast.message) {
        const timer = setTimeout(() => {
            setToast({ message: "", type: "" });
        }, 3000);  // 3 seconds

        return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/wordplay-scan`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => response.json())
    .then((result) => {
      setData(result);
      setItems(result);
    });
  }, []);
  

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



  const handleApprovalAction = async (itemId: string, action: string, status: string) => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/wordplay-approval`;
    const params = new URLSearchParams({
        id: itemId,
        action: action,
        status: status
    });

    try {
        const response = await fetch(`${apiUrl}?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
          setToast({ 
            message: `${action.charAt(0).toUpperCase() + action.slice(1)} success.`, 
            type: "success" 
        });
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));

    } catch (error) {
        setToast({ message: "Error during the API call.", type: "error" });
    }
  };


  const togglePendingItems = () => {
    setShowPendingOnly(prevState => !prevState);
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

  return (
    <div>

      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
  <Head>
        <title>WordPlay: Admin</title>
      </Head>
  <label className="switch">
  <input type="checkbox" checked={showPendingOnly} onChange={togglePendingItems} />
  <span className="slider round"></span>
</label>

<span style={{ paddingLeft: '10px' }}>
  {showPendingOnly ? 'Show Pending Only' : 'Show All'}
</span>


      <input
        type="text"
        className="search-input"
        placeholder="Search by Acronym or Abbreviation"
        value={searchTerm}
        onChange={handleInputChange}
      />
  
        {/* {showResults && items.map((item) => { */}
        {sortedItems.map(item => {

if (showPendingOnly) {
    if (!item.status.includes('pending')) {
        return null;
    }
} else {
    if (item.status.includes('pending')) {
        return null;
    }
}

        if (item.status.includes('pending_add')) {
          return (
            <div key={item.id} className="info-item">
            <div className="pending">Add</div>
        {item.acronym}: {item.abbreviation} <br />
        Requestor: {item.by} <br />     
        <div className="button-group">
        <button onClick={() => handleApprovalAction(item.id, 'approve', item.status)} className="approve-button">Approve</button>
        <button onClick={() => handleApprovalAction(item.id, 'reject', item.status)} className="reject-button">Reject</button>

                </div>  
         </div>
          );

        } else if (item.status.includes('pending_delete')) {
          const [status, byEmail] = item.status.split('-by-');
          return (
            <div key={item.id} className="info-item">
            <div className="pending">Delete</div>
        {item.acronym}: {item.abbreviation} <br />
        Requestor: {byEmail} <br />
        <div className="button-group">
        <button onClick={() => handleApprovalAction(item.id, 'approve', item.status)} className="approve-button">Approve</button>
              <button onClick={() => handleApprovalAction(item.id, 'reject', item.status)} className="reject-button">Reject</button>
                </div>
            </div>
          );

        } else if (item.status.includes('pending_update')) {
        const pattern = /^pending_update-(.+)-to-(.+)-and-(.+)-to-(.+)-by-(.+)$/;

        const match = item.status.match(pattern);
        
        if (match) {

          const oldAcronym = match[1];
          const newAcronym = match[2];
          const oldAbbreviation = match[3].trim();
          const newAbbreviation = match[4].trim();
          const email = match[5];
          return (
            <div key={item.id} className="info-item">
            <div className="pending">Update</div>
       
              {oldAcronym} ⇒ {newAcronym} <br />
              {oldAbbreviation} ⇒ {newAbbreviation} <br />
              Requestor: {email}
              <div className="button-group">
              <button onClick={() => handleApprovalAction(item.id, 'approve', item.status)} className="approve-button">Approve</button>
              <button onClick={() => handleApprovalAction(item.id, 'reject', item.status)} className="reject-button">Reject</button>
                </div>
            </div>
          );

        }
      
    } else {

        return (
            <div key={item.id} className="info-item">
                {item.acronym}: {item.abbreviation} <br/>
                By: {item.by} <br/>
                Status: {item.status} 
            </div>
        );
        }
        return null;
      })}

    </div>
  );
  
}
      
