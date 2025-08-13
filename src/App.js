import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Data for all the questions in the assessment
const questions = [
  { id: 'name', label: '1. Name:', type: 'text', required: true },
  { id: 'email', label: '2. Email Address:', type: 'email', required: true },
  { id: 'contact', label: '3. Contact No.:', type: 'tel', required: true },
  { id: 'gender', label: '4. Gender:', type: 'radio', options: ['Female', 'Male', 'Prefer not to say'], required: true },
  { id: 'dob', label: '5. Date of Birth:', type: 'date', required: true },
  { id: 'address', label: '6. Present Address:', type: 'textarea', required: true },
  { id: 'hobbies', label: '7. Hobbies:', type: 'text', required: true },
  { id: 'skills', label: '8. Skills (Best 3):', type: 'text', required: true },
  { id: 'laptop', label: '9. Do you have a personal laptop?', type: 'radio', options: ['Yes', 'No'], required: true },
  { id: 'wfh', label: '10. Are you comfortable working from home for 5 days a week (4 hours/day & flexible timings)?', type: 'radio', options: ['Yes', 'No'], required: true },
  { id: 'unpaid', label: '11. Why do you want to join this internship when it is unpaid?', type: 'textarea', required: true },
  { id: 'expectations', label: '12. What makes you passionate about the role of a Marketing & Public Relations Intern?', type: 'textarea', required: true },
  { id: 'achievement', label: '13. What has been the biggest achievement of your life?', type: 'textarea', required: true },
  { id: 'strengths', label: '14. What are your strengths? (please mention at least 4)', type: 'textarea', required: true },
  { id: 'weaknesses', label: '15. What are your weaknesses? (please mention at least 4)', type: 'textarea', required: true },
  { id: 'stress', label: '16. What do you understand by chronic work-stress? What are the reasons behind it and how to deal with them?', type: 'textarea', required: true },
  { id: 'counseling', label: '17. Do you believe there is a need for career counseling platforms in today\'s world? Why?', type: 'textarea', required: true },
  { id: 'mindset', label: '18. Can you demonstrate your service mindset with an example from your past?', type: 'textarea', required: true },
  { id: 'eq', label: '19. How much would you rate your EQ out of 10? Describe a hypothetical situation which could instantly overwhelm your emotions? How would you recover from such situation?', type: 'textarea', required: true },
];

// --- Timer Component ---
const Timer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft === 0) {
      onTimeUp();
      return;
    }
    const intervalId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="timer">
      Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

// --- Question Component ---
const Question = ({ question, value, onChange, onPasteAttempt }) => {
  const handleChange = (e) => {
    onChange(question.id, e.target.value);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'textarea':
        return <textarea id={question.id} value={value} onChange={handleChange} onPaste={onPasteAttempt} rows="5" required={question.required} />;
      case 'radio':
        return (
          <div className="radio-group">
            {question.options.map(option => (
              <label key={option}>
                <input type="radio" name={question.id} value={option} checked={value === option} onChange={handleChange} required={question.required} />
                {option}
              </label>
            ))}
          </div>
        );
      default: // Catches text, email, tel, date
        return <input type={question.type} id={question.id} value={value} onChange={handleChange} onPaste={onPasteAttempt} required={question.required} />;
    }
  };

  return (
    <div className="form-group">
      <label htmlFor={question.id}>{question.label}{question.required && ' *'}</label>
      {renderInput()}
    </div>
  );
};

// --- Main App Component ---
// --- Main App Component ---
function App() {
  const [testState, setTestState] = useState('not_started');
  const [answers, setAnswers] = useState({});
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  // NEW: State to manage the submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');


  const handleStartTest = () => {
    setTestState('in_progress');
  };

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // NEW: This function is now asynchronous and handles the API call
  const handleAutoSubmit = useCallback(async () => {
    // Prevent function from running if test isn't in progress or already submitting
    if (testState !== 'in_progress' || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(''); // Clear previous errors
    console.log("Submitting final answers:", answers);

    try {
      // The actual API call to your Google Cloud Function
      const response = await fetch('https://submit-ikipendence-assessment-501301043511.asia-south1.run.app', { // <-- PASTE YOUR TRIGGER URL HERE
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      // If the server responds with an error, handle it
      if (!response.ok) {
        throw new Error('A network error occurred. Please try submitting again.');
      }

      // If successful, move to the submitted screen
      setTestState('submitted');

    } catch (error) {
      console.error("Submission error:", error);
      // Display the error message to the user
      setSubmitError(error.message);
    } finally {
      // Ensure the submitting state is reset whether it succeeded or failed
      setIsSubmitting(false);
    }
  }, [answers, testState, isSubmitting]); // NEW: Added isSubmitting to dependency array

  const handlePasteAttempt = (e) => {
    e.preventDefault();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 3000);
  };

  const preventAction = (e) => {
    e.preventDefault();
  }

  // Render different views based on the test state
  if (testState === 'not_started') {
    return (
      <div className="app-container" onContextMenu={preventAction} onCopy={preventAction}>
        <div className="start-screen">
          <h1>Welcome to the ikipendence Behavioural Assessment</h1>
          <p>The test consists of {questions.length} questions and you will have <strong>30 minutes</strong> to complete it.</p>
          <p>The test will be automatically submitted when the time runs out.</p>
          {/* <p className="security-notice"><strong>Note:</strong> For a fair assessment, right-clicking, copying, and pasting are disabled.</p> */}
          <button onClick={handleStartTest} className="submit-btn">Start Test</button>
        </div>
      </div>
    );
  }

  if (testState === 'submitted') {
    return (
      <div className="app-container" onContextMenu={preventAction} onCopy={preventAction}>
        <div className="submission-screen">
          <h2>Thank You!</h2>
          <p>Your assessment has been submitted successfully.</p>
          <h3>Your Submitted Answers:</h3>
          <div className="answers-review">
            {questions.map(q => (
              <div key={q.id}>
                <strong>{q.label}</strong>
                <p>{answers[q.id] || 'Not Answered'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" onContextMenu={preventAction} onCopy={preventAction}>
      <div className="form-container">
        <header className="test-header">
          <h2>ikipendence Behavioural Assessment</h2>
          <Timer duration={30 * 60} onTimeUp={handleAutoSubmit} />
        </header>
        {showPasteWarning && <div className="paste-warning">Pasting is not allowed!</div>}
        
        {/* NEW: Display a submission error message if one exists */}
        {submitError && <div className="error-notice">{submitError}</div>}

        <form onSubmit={(e) => { e.preventDefault(); handleAutoSubmit(); }}>
          {questions.map(q => (
            <Question key={q.id} question={q} value={answers[q.id] || ''} onChange={handleInputChange} onPasteAttempt={handlePasteAttempt}/>
          ))}
          
          {/* NEW: The button is now disabled during submission and shows a different text */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;