const express = require('express');

const router = express.Router();
router.use(express.json());

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (password === 'm295' && email) {
    req.session.authenticated = true;
    req.session.email = email;
    res.status(201).json({ email: req.session.email });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.get('/verify', async (req, res) => {
  if (req.session.authenticated) {
    res.status(200).json({ email: req.session.email });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

router.delete('/logout', async (req, res) => {
  if (req.session.authenticated) {
    req.session.email = null;
    req.session.authenticated = null;

    res.sendStatus(204);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;
