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
} from 'react-bootstrap';



export function ChatBoard() {
  const auth = useAuth();
  const [message, setMessage] = useState('');
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatBoxRef = useRef(null);

  const token = auth.user?.id_token; // id_token for signout_hint
  const accessToken = auth.user?.access_token;
  const username =
    auth.user?.profile.preferred_username ||
    auth.user?.profile.email ||
    auth.user?.profile.sub;

  const apiBase =
    'https://uh67id1ya4.execute-api.us-east-1.amazonaws.com/prod';

  useEffect(() => {
    if (auth.isAuthenticated) {
      loadMessages();
      const intervalId = setInterval(loadMessages, 8000);
      return () => clearInterval(intervalId);
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [msgs]);

  const loadMessages = async () => {
    if (!accessToken || accessToken.trim() === "") return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      setMsgs(
        data.sort(
          (a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt)
        )
      );
    } catch (err) {
      console.error('Failed to load messages', err);
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !accessToken) return;
    setError(null);

    try {
      const response = await fetch(`${apiBase}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message, username }),
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      setMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Could not send message.');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4 fw-bold">💬 Real-Time Chat Board</h2>

      {!auth.isAuthenticated && (
        <Row className="justify-content-center mb-4">
          <Col md={6} className="text-center">
            <p>Login or signup to start chatting.</p>
            <Button
              variant="primary"
              className="me-2"
              onClick={() => auth.signinRedirect()}
            >
              Login / Signup
            </Button>
            {auth.error && (
              <Alert variant="danger" className="mt-3">
                {auth.error.message}
              </Alert>
            )}
          </Col>
        </Row>
      )}

      {auth.isAuthenticated && (
        <>
          <div className="text-center mb-3">
            <p className="fw-bold">Welcome! {username}</p>
            <Button
              variant="outline-danger"
              onClick={() =>
                auth.signoutRedirect({ id_token_hint: token})
              }
            >
              Sign Out
            </Button>
          </div>

          <div
            id="chat-box"
            ref={chatBoxRef}
            style={{
              height: '400px',
              overflowY: 'scroll',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: '#f9f9f9',
            }}
            className="mb-3"
          >
            {loading ? (
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <ListGroup variant="flush">
                {msgs.map((m) => (
                  <ListGroup.Item key={m.MessageID}>
                    <strong>{m.Username}:</strong>
                    <div>{m.Message}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={sendMessage} className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" className="ms-2">
              Send
            </Button>
          </Form>
        </>
      )}
    </Container>
  );
}

export default function App() {
  return <ChatBoard />;
}
