// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventVoting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct EventData {
        string eventName;
        Candidate[] candidates;
        bool votingStarted;
        bool votingEnded;
        uint256 votingStart;
        uint256 votingEnd;
    }

    address public owner;
    uint256 public currentEventId;

    // eventId => EventData
    mapping(uint256 => EventData) private eventsData;

    // eventId => (voter => hasVoted)
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner!");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Start with event ID = 0 for the first event
        currentEventId = 0;
    }

    function setupEvent(
        string memory _eventName,
        string[] memory _candidateNames
    ) public onlyOwner {
        currentEventId++; // increment event ID for the new event

        // Initialize the new event
        eventsData[currentEventId].eventName = _eventName;
        eventsData[currentEventId].votingStarted = false;
        eventsData[currentEventId].votingEnded = false;
        eventsData[currentEventId].votingStart = 0;
        eventsData[currentEventId].votingEnd = 0;

        // Clear any existing candidates array for this eventId
        delete eventsData[currentEventId].candidates;

        // Populate candidates for this new event
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            eventsData[currentEventId].candidates.push(
                Candidate({ name: _candidateNames[i], voteCount: 0 })
            );
        }
    }

    function startVoting(uint256 _durationInSeconds) public onlyOwner {
        EventData storage e = eventsData[currentEventId];
        require(!e.votingStarted, "Voting already started.");
        require(e.candidates.length > 0, "No candidates set.");
        require(_durationInSeconds > 0, "Invalid duration.");

        e.votingStarted = true;
        e.votingEnded = false;
        e.votingStart = block.timestamp;
        e.votingEnd = block.timestamp + _durationInSeconds;
    }

    function endVoting() public onlyOwner {
        EventData storage e = eventsData[currentEventId];
        require(e.votingStarted, "Voting not started yet.");
        require(!e.votingEnded, "Voting already ended.");

        e.votingEnded = true;
    }

    function vote(uint256 _candidateIndex) public {
        EventData storage e = eventsData[currentEventId];
        require(e.votingStarted, "Voting has not started.");
        require(!e.votingEnded, "Voting ended.");
        require(block.timestamp < e.votingEnd, "Voting time is over.");
        require(!hasVoted[currentEventId][msg.sender], "Already voted.");
        require(_candidateIndex < e.candidates.length, "Invalid candidate index.");

        hasVoted[currentEventId][msg.sender] = true;
        e.candidates[_candidateIndex].voteCount++;
    }

    // --------------- VIEW FUNCTIONS ----------------

    /**
     * @dev Returns the current event ID.
     */
    function getCurrentEventId() public view returns (uint256) {
        return currentEventId;
    }

    /**
     * @dev Returns the event info for a given eventId.
     * [ name, started, ended, startTimestamp, endTimestamp ]
     */
    function getEventInfo(uint256 _eventId)
        public
        view
        returns (
            string memory name,
            bool started,
            bool ended,
            uint256 startTime,
            uint256 endTime
        )
    {
        EventData storage e = eventsData[_eventId];
        name = e.eventName;
        started = e.votingStarted;
        ended = e.votingEnded;
        startTime = e.votingStart;
        endTime = e.votingEnd;
    }

    /**
     * @dev Returns the list of candidates for a given eventId.
     */
    function getCandidates(uint256 _eventId)
        public
        view
        returns (Candidate[] memory)
    {
        return eventsData[_eventId].candidates;
    }

    /**
     * @dev For convenience, get the current event’s name.
     */
    function getCurrentEventName() public view returns (string memory) {
        return eventsData[currentEventId].eventName;
    }
}
