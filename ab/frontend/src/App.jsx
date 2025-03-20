import { useState, useEffect } from "react";
import { ethers } from "ethers";
import EventVotingABI from "./EventVoting.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  // --------------------- STATE ---------------------
  const [account, setAccount] = useState("");
  const [currentEventId, setCurrentEventId] = useState(0);

  // For setupEvent
  const [eventName, setEventName] = useState("");
  const [candidateNames, setCandidateNames] = useState([""]);

  // For startVoting
  const [duration, setDuration] = useState("");

  // For displaying loaded event info
  const [loadedEventName, setLoadedEventName] = useState("");
  const [votingStarted, setVotingStarted] = useState(false);
  const [votingEnded, setVotingEnded] = useState(false);
  const [votingEndTime, setVotingEndTime] = useState("0");

  // Candidates array for the loaded event
  const [candidates, setCandidates] = useState([]);

  // --------------------- ON MOUNT: Check if Already Connected ---------------------
  useEffect(() => {
    checkIfAlreadyConnected();
  }, []);

  // If we have an account, load contract data
  useEffect(() => {
    if (account) {
      loadContractData();
    }
  }, [account]);

  // --------------------- Check if Already Connected ---------------------
  async function checkIfAlreadyConnected() {
    if (!window.ethereum) {
      console.warn("MetaMask not found. Please install it!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      // Ethers v6: 'accounts' is an array of Account objects: [{ provider, address }, ...]
      if (accounts.length > 0) {
        setAccount(accounts[0].address); // Store just the string address
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  }

  // --------------------- CONNECT WALLET (User Trigger) ---------------------
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // First see if we're already connected
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        return;
      }

      // Otherwise, request the user to connect
      const requestedAccounts = await provider.send("eth_requestAccounts", []);
      // This usually returns an array of string addresses
      if (requestedAccounts.length > 0) {
        setAccount(requestedAccounts[0]);
      }
    } catch (err) {
      console.error("connectWallet error:", err);
      // Possibly code -32002: already processing a request
    }
  };

  // --------------------- LOAD CONTRACT DATA (for the current event) ---------------------
  const loadContractData = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        EventVotingABI.abi,
        provider
      );

      // 1) Get the currentEventId
      const eventId = await contract.getCurrentEventId();
      setCurrentEventId(eventId.toNumber());

      // 2) Retrieve the event info for this current event
      const eventInfo = await contract.getEventInfo(eventId);
      // eventInfo is: [name, started, ended, startTime, endTime]
      const name = eventInfo[0];
      const started = eventInfo[1];
      const ended = eventInfo[2];
      // const startTime = eventInfo[3]; // not used in this example
      const endTime = eventInfo[4];

      // 3) Retrieve candidates for this event
      const candList = await contract.getCandidates(eventId);

      // Update state
      setLoadedEventName(name);
      setVotingStarted(started);
      setVotingEnded(ended);
      setVotingEndTime(endTime.toString());
      setCandidates(candList);
    } catch (err) {
      console.error("Error loading contract data:", err);
    }
  };

  // --------------------- OWNER-ONLY: setupEvent ---------------------
  const handleSetupEvent = async () => {
    try {
      if (!eventName || candidateNames.length === 0) {
        alert("Please provide event name and at least one candidate!");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        EventVotingABI.abi,
        signer
      );

      const filteredNames = candidateNames.filter((name) => name.trim() !== "");
      if (filteredNames.length === 0) {
        alert("Please provide at least one candidate name");
        return;
      }

      const tx = await contract.setupEvent(eventName, filteredNames);
      await tx.wait();

      alert("Event setup completed!");

      // After setting up the event, the contract increments currentEventId
      // So we reload to see the new event’s data
      loadContractData();

      // Optionally reset your local inputs
      setEventName("");
      setCandidateNames([""]);
    } catch (err) {
      console.error(err);
      alert("Setup failed. See console for details.");
    }
  };

  // --------------------- OWNER-ONLY: startVoting ---------------------
  const handleStartVoting = async () => {
    try {
      const dur = parseInt(duration, 10);
      if (!dur || dur <= 0) {
        alert("Duration must be a positive number!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        EventVotingABI.abi,
        signer
      );

      const tx = await contract.startVoting(dur);
      await tx.wait();

      alert("Voting has started!");
      loadContractData();
    } catch (err) {
      console.error(err);
      alert("Error starting voting");
    }
  };

  // --------------------- OWNER-ONLY: endVoting ---------------------
  const handleEndVoting = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        EventVotingABI.abi,
        signer
      );

      const tx = await contract.endVoting();
      await tx.wait();

      alert("Voting has ended!");
      loadContractData();
    } catch (err) {
      console.error(err);
      alert("Error ending voting");
    }
  };

  // --------------------- Casting a Vote ---------------------
  const vote = async (candidateIndex) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        EventVotingABI.abi,
        signer
      );
      const tx = await contract.vote(candidateIndex);
      await tx.wait();

      alert(`Successfully voted for candidate #${candidateIndex}`);
      loadContractData();
    } catch (err) {
      console.error(err);
      alert("Voting failed. Possibly already voted or voting is over.");
    }
  };

  // --------------------- UI Helpers: Candidate Fields ---------------------
  const handleAddCandidateField = () => {
    setCandidateNames([...candidateNames, ""]);
  };

  const handleCandidateNameChange = (idx, value) => {
    const newNames = [...candidateNames];
    newNames[idx] = value;
    setCandidateNames(newNames);
  };

  // Check if the current time is beyond the votingEndTime
  const isTimeUp = () => {
    if (!votingEndTime || votingEndTime === "0") return false;
    return Date.now() / 1000 > parseInt(votingEndTime);
  };

  // --------------------- HELPER: Format Timestamp ---------------------
  function formatTimestamp(timestamp) {
    if (!timestamp || timestamp === "0") return "Not set";
    const dateObj = new Date(Number(timestamp) * 1000);
    return dateObj.toLocaleString();
  }

  // --------------------- STYLES ---------------------
  const pageStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    minHeight: "100vh",
    width: "98vw",
    margin: 0,
    padding: 0,
    color: "#fff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    padding: "2rem",
    boxSizing: "border-box",
    minHeight: "100vh",
  };

  const headingStyle = {
    marginTop: 0,
    marginBottom: "1rem",
    textAlign: "center",
    color: "#fff",
  };

  const cardStyle = {
    backgroundColor: "#1e1e1e",
    border: "1px solid #333",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.6)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    width: "100%",
    maxWidth: "600px",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "bold",
  };

  const inputStyle = {
    padding: "0.5rem",
    marginBottom: "1rem",
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #555",
    borderRadius: "4px",
    backgroundColor: "#2d2d2d",
    color: "#eee",
  };

  const buttonStyle = {
    padding: "0.5rem 1rem",
    marginRight: "0.5rem",
    marginTop: "0.5rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#03a9f4",
    color: "#fff",
    cursor: "pointer",
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d",
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#555",
    cursor: "not-allowed",
  };

  const voteButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    marginLeft: "10px",
  };

  const addCandidateBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#17a2b8",
    marginTop: "0.5rem",
  };

  const infoTextStyle = {
    color: "#bbb",
    marginTop: "0.5rem",
  };

  const endedTextStyle = {
    marginTop: "1rem",
    color: "limegreen",
  };

  const notStartedTextStyle = {
    color: "#ff4d4d",
  };

  // --------------------- RENDER ---------------------
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={headingStyle}>Multi-Event Voting DApp</h1>

        {/* If not connected, show a "Connect Wallet" button */}
        {!account && (
          <div style={cardStyle}>
            <h2>Please Connect Your Wallet</h2>
            <button onClick={connectWallet} style={buttonStyle}>
              Connect Wallet
            </button>
          </div>
        )}

        {/* Once connected, render the rest of the DApp */}
        {account && (
          <>
            <p style={{ textAlign: "center", color: "#bbb" }}>
              <b>Connected Account:</b> {account}
            </p>

            <div style={infoTextStyle}>
              <b>Current Event ID:</b> {currentEventId}
            </div>

            {/* 1. Setup Event (Owner) */}
            <div style={cardStyle}>
              <h2>1. Setup a New Event (Owner Only)</h2>
              <label style={labelStyle}>Event Name:</label>
              <input
                type="text"
                style={inputStyle}
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g. My Awesome Event"
              />

              <h4 style={{ margin: "1rem 0 0.5rem 0" }}>Candidates:</h4>
              {candidateNames.map((name, idx) => (
                <input
                  key={idx}
                  type="text"
                  style={inputStyle}
                  placeholder="Candidate Name"
                  value={name}
                  onChange={(e) =>
                    handleCandidateNameChange(idx, e.target.value)
                  }
                />
              ))}

              <button
                onClick={handleAddCandidateField}
                style={addCandidateBtnStyle}
              >
                + Add Another Candidate
              </button>
              <br />

              <button onClick={handleSetupEvent} style={buttonStyle}>
                Setup Event
              </button>
            </div>

            {/* 2. Control Voting (Owner) */}
            <div style={cardStyle}>
              <h2>2. Control Voting (Owner Only)</h2>
              <label style={labelStyle}>Voting Duration (seconds):</label>
              <input
                type="number"
                style={inputStyle}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 300"
                min="1"
              />

              <button
                onClick={handleStartVoting}
                style={
                  votingStarted && !votingEnded
                    ? disabledButtonStyle
                    : buttonStyle
                }
                disabled={votingStarted && !votingEnded}
              >
                Start Voting
              </button>
              <button
                onClick={handleEndVoting}
                style={
                  !votingStarted || votingEnded
                    ? disabledButtonStyle
                    : secondaryButtonStyle
                }
                disabled={!votingStarted || votingEnded}
              >
                End Voting
              </button>

              <p style={infoTextStyle}>
                <b>Voting Started:</b> {votingStarted ? "Yes" : "No"}
              </p>
              <p style={infoTextStyle}>
                <b>Voting Ended:</b> {votingEnded || isTimeUp() ? "Yes" : "No"}
              </p>
              <p style={infoTextStyle}>
                <b>Voting End Time:</b> {formatTimestamp(votingEndTime)}
              </p>
            </div>

            {/* 3. Cast Vote */}
            <div style={cardStyle}>
              <h2>3. Cast Vote for Current Event</h2>
              <p style={infoTextStyle}>
                <b>Event Name:</b> {loadedEventName}
              </p>
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {candidates.map((candidate, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: "0.75rem",
                      padding: "0.5rem 0.75rem",
                      background: "#2d2d2d",
                      borderRadius: "4px",
                      border: "1px solid #333",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>{candidate.name}</strong> &mdash;{" "}
                      {candidate.voteCount.toString()} votes
                    </span>
                    {/* Show "Vote" button only if voting is active */}
                    {!votingEnded && !isTimeUp() && votingStarted && (
                      <button onClick={() => vote(i)} style={voteButtonStyle}>
                        Vote
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Show final results if voting ended or time is up */}
              {votingEnded || isTimeUp() ? (
                <div style={endedTextStyle}>
                  <h3>Voting has ended! Final Results</h3>
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {candidates.map((candidate, i) => (
                      <li
                        key={i}
                        style={{
                          marginBottom: "0.5rem",
                          padding: "0.5rem 0.75rem",
                          background: "#2d2d2d",
                          borderRadius: "4px",
                          border: "1px solid #333",
                        }}
                      >
                        {candidate.name} &mdash;{" "}
                        {candidate.voteCount.toString()} votes
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={notStartedTextStyle}>
                  {votingStarted
                    ? "Voting is open! Cast your vote."
                    : "Voting has not started yet."}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
