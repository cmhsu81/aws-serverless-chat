import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import {
  Button,
  Form,
  Container,
  ListGroup,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
} from 'react-bootstrap';


export function ChatBoard() {
  const auth = useAuth();
  const [message, setMessage] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [changeDisabled, setChangeDisabled] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  const chatBoxRef = useRef(null);
  //const token = auth.user?.id_token;
  const accessToken = auth.user?.access_token;

   // Safely extract profile and custom attributes after authentication
  const profile = auth.user?.profile ?? {};
  const currentUsername = profile['custom:username'] || profile.preferred_username || profile.email || profile.sub || '';
  const lastChange = profile['custom:lastUsernameChange'];

  //const profile = auth.user?.profile;
  //const currentUsername = profile['custom:username'];
  //const lastChange = profile['custom:lastUsernameChange'];
  const displayName = currentUsername;
  
  const apiBase = 'https://uh67id1ya4.execute-api.us-east-1.amazonaws.com/prod';

  // Store original title and favicon
  const originalTitle = useRef(document.title);
  const originalFavicon = useRef(
    document.querySelector("link[rel='icon']").getAttribute('href')
  );
  // Track alert interval and unseen messages count
  const alertInterval = useRef(null);
  const unseenCount = useRef(0);
  const prevTotal    = useRef(0)

  // Listen for visibility changes and focus events
  useEffect(() => {
    document.title = 'Serveless Chat Board'; 

    const handleVisibility = () => {
      if (!document.hidden) {
        clearAlert()

        // reset counters to current OTHER‐user total
        const otherMsgs = msgs.filter(m => m.Username !== displayName)
        prevTotal.current = otherMsgs.length
        unseenCount.current = 0
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleVisibility)
    }
  }, [msgs, displayName])


  
  // Load messages periodically
  useEffect(() => {
    if (auth.isAuthenticated) {
      loadMessages();
      const iv = setInterval(loadMessages, 8000);
      return () => clearInterval(iv);
    }
  }, [auth.isAuthenticated]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }

    // only consider messages not sent by current user:
    const otherMsgs = msgs.filter(m => m.Username !== displayName)
    const newTotal  = otherMsgs.length

    // if tab hidden AND there are more other‐user messages than before:
    if (auth.isAuthenticated && document.hidden && newTotal > prevTotal.current) {
      unseenCount.current = newTotal - prevTotal.current   // NEW: delta
      prevTotal.current   = newTotal                        // NEW: update for next time
      startAlert()
    }
  }, [msgs, auth.isAuthenticated, displayName])
  

  const startAlert = () => {
    if (alertInterval.current) return;
    alertInterval.current = setInterval(() => {
      // Toggle title
      document.title =
        document.title === originalTitle.current
          ? `(${unseenCount.current}) New message!`
          : originalTitle.current;
      // Toggle favicon
      const link = document.querySelector("link[rel='icon']");
      link.href =
        link.href.endsWith('favicon-alert.ico')
          ? originalFavicon.current
          : '/favicon-alert.ico';
    }, 1000);
  };

  const clearAlert = () => {
    if (alertInterval.current) {
      clearInterval(alertInterval.current);
      alertInterval.current = null;
      document.title = originalTitle.current;
      const link = document.querySelector("link[rel='icon']");
      link.href = originalFavicon.current;
    }
  };

  // init username change interval
  useEffect(() => {
    if (lastChange) {
      const lastDate = new Date(lastChange);
      const diffMs = Date.now() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        setChangeDisabled(true);
        setDaysLeft(7 - diffDays);
      }
    }
  }, [lastChange]);


  const loadMessages = async () => {
    if (!accessToken || !accessToken.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/messages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.user.id_token}` },
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setMsgs(data.sort((a,b) => new Date(a.CreatedAt) - new Date(b.CreatedAt)));
    } catch (e) {
      console.error('Load messages error', e);
      setError('Could not load messages.');
    } finally { setLoading(false); }
  };

  const sendMessage = async e => {
    e.preventDefault();
    if (!message.trim() || !accessToken) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.user.id_token}` },
        body: JSON.stringify({ message, username: displayName }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setMessage('');
      await loadMessages();
    } catch (e) {
      console.error('Send error', e);
      setError('Could not send message.');
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);


  const handleChangeUsername = async () => {
    if (!newUsername.trim()) return;
    if (!accessToken) {
      setError('You must be logged in to change your username.');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          changeUsername: true,
          username: newUsername.trim(),
        }),
      });

      if (!res.ok) throw new Error(`Status ${res.status}`);
      
      setShowModal(false);
      setChangeDisabled(true);
      setDaysLeft(7);
      setError(null);
      window.location.reload();
    } catch (e) {
      console.error('Change username error', e);
      setError('Failed to change username.');
    }
  };

  const logout = () => {
    const clientId = '2fcgrmmovvgt1sfo180bkp2kan';
    const logoutUri = encodeURIComponent('https://prod.d1xsb7yotrm5oo.amplifyapp.com');
    const domain = 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com';
    window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  };
  const logoutAndClear = () => { auth.removeUser(); logout(); };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4 fw-bold" style={{ fontSize: '2rem' }}>Serveless Chat Board💬</h2>

      {!auth.isAuthenticated && (
        <Row className="justify-content-center mb-4">
          <Col md={6} className="text-center">
            <p>Login or signup to start chatting.</p>
            <Button variant="primary" onClick={() => auth.signinRedirect()}>Login / Signup</Button>
            {auth.error && <Alert variant="danger" className="mt-3">{auth.error.message}</Alert>}
          </Col>
        </Row>
      )}

      {auth.isAuthenticated && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p className="fw-bold" style={{ color: '#660303' }}>Welcome! {displayName}</p>
              <Button variant="outline-secondary" disabled={changeDisabled} onClick={openModal}>
                Change Username
              </Button>
              {changeDisabled && <small className="ms-2 text-muted">({daysLeft} days until next change)</small>}
            </div>
            <Button variant="outline-danger" onClick={logoutAndClear}>Sign Out</Button>
          </div>

          <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Change Username</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>New Username</Form.Label>
                <Form.Control
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" onClick={handleChangeUsername}>Save</Button>
            </Modal.Footer>
          </Modal>

          <div id="chat-box" ref={chatBoxRef} style={{ height: '500px', overflowY: 'scroll', border: '1px solid #ccc', borderRadius: '10px', padding: '10px', backgroundColor: '#f9f9f9' }} className="mb-3">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100"><Spinner animation="border" /></div>
            ) : (
              <ListGroup variant="flush">
                {msgs.map(m => (
                  <ListGroup.Item key={m.MessageID}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong><span style={{ color: '#0E8B99' }}>{`${m.Username} (${m.Email}):`}</span></strong>
                        <div>{m.Message}</div>
                      </div>
                      <small className="text-muted" style={{ whiteSpace: 'nowrap' }}>
                        {new Date(m.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={sendMessage} className="d-flex">
            <Form.Control type="text" placeholder="Type your message..." value={message} onChange={e => setMessage(e.target.value)} />
            <Button type="submit" className="ms-2">Send</Button>
          </Form>
        </>
      )}
    </Container>
  );
}

export default function App() {
  return (
    <ChatBoard />
  )
}
