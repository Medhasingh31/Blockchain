// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentFeedback {
    struct Feedback {
        uint id;
        string ipfsHash;
        address student;
        string courseId;
        string status;
        uint timestamp;
    }

    address public admin;
    uint public feedbackCounter;
    mapping(uint => Feedback) public feedbacks;

    event FeedbackSubmitted(
        uint indexed feedbackId,
        address indexed student,
        string courseId,
        string ipfsHash,
        uint timestamp
    );

    event StatusUpdated(
        uint indexed feedbackId,
        string newStatus,
        uint timestamp
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        feedbackCounter = 0;
    }

    function submitFeedback(string memory ipfsHash, string memory courseId) public {
        feedbackCounter++;
        
        feedbacks[feedbackCounter] = Feedback({
            id: feedbackCounter,
            ipfsHash: ipfsHash,
            student: msg.sender,
            courseId: courseId,
            status: "Pending",
            timestamp: block.timestamp
        });

        emit FeedbackSubmitted(
            feedbackCounter,
            msg.sender,
            courseId,
            ipfsHash,
            block.timestamp
        );
    }

    function updateStatus(uint feedbackId, string memory newStatus) public onlyAdmin {
        require(feedbackId > 0 && feedbackId <= feedbackCounter, "Invalid feedback ID");
        
        feedbacks[feedbackId].status = newStatus;

        emit StatusUpdated(feedbackId, newStatus, block.timestamp);
    }

    function getFeedback(uint feedbackId) public view returns (Feedback memory) {
        require(feedbackId > 0 && feedbackId <= feedbackCounter, "Invalid feedback ID");
        return feedbacks[feedbackId];
    }

    function getAllFeedback() public view returns (Feedback[] memory) {
        Feedback[] memory allFeedback = new Feedback[](feedbackCounter);
        
        for (uint i = 1; i <= feedbackCounter; i++) {
            allFeedback[i - 1] = feedbacks[i];
        }
        
        return allFeedback;
    }
}
