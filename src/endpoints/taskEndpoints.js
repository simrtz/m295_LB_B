/* eslint-disable camelcase */
// Json properties created_at and completed_at wouldn't be mapped correctly,
// if camelCase was used
//

const express = require('express');
const fs = require('fs');

const router = express.Router();
router.use(express.json());

const taskData = '../resources/tasks.json';

router.get('/', async (req, res) => {
  if (req.session.authenticated) {
    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    if (!tasks) {
      res.status(404).json({ error: 'No tasks found' });
    }

    res.status(200).json(tasks);
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.get('/:id', async (req, res) => {
  if (req.session.authenticated) {
    const { id } = req.params;

    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    const task = tasks.find((wantedTask) => wantedTask.id === parseInt(id, 10));

    if (!task) {
      res.status(404).json({ error: `No task with id: '${id}' found` });
    }

    res.status(200).json(task);
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.post('/', async (req, res) => {
  if (req.session.authenticated) {
    const { title } = req.body;
    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    if ((typeof title !== 'string')
    ) {
      res.status(406).json({ error: "Json is invalid. Required properties are: 'title': String" });
    } else {
      const newTask = {
        title,
        id: !tasks ? 1 : tasks[tasks.length - 1].id + 1,
        author: req.session.email,
        created_at: new Date(),
        completed_at: '',
      };

      tasks.push(newTask);
      await fs.promises.writeFile(taskData, JSON.stringify(tasks, null, 2))
        .catch((err) => res.status(500).json({ error: `An Error occured while writing data. Err: ${err}` }));

      res.status(201).json(newTask);
    }
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.put('/:id', async (req, res) => {
  if (req.session.authenticated) {
    const { title, created_at, completed_at } = req.body;
    const { id } = req.params;

    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));

    if (typeof title !== 'string'
        || typeof created_at !== 'string'
        || typeof completed_at !== 'string'
    ) {
      res.status(406).json({ error: "Json is invalid. Required properties are: 'title': String, 'created_at': String, 'completed_at': String" });
    } else {
      const task = tasks.find((wantedTask) => wantedTask.id === parseInt(id, 10));

      if (!task) {
        res.status(404).json({ error: `no task with id: '${id}' found` });
      } else {
        const updatedTask = {
          id: parseInt(id, 10),
          title,
          author: req.session.email,
          created_at,
          completed_at,
        };

        tasks[tasks.indexOf(task)] = updatedTask;
        await fs.promises.writeFile(taskData, JSON.stringify(tasks, null, 2))
          .catch((err) => res.status(500).json({ error: `An Error occured while writing data. Err: ${err}` }));

        res.status(200).json(updatedTask);
      }
    }
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

router.delete('/:id', async (req, res) => {
  if (req.session.authenticated) {
    const { id } = req.params;
    const tasks = JSON.parse(await fs.promises.readFile(taskData)
      .catch((err) => res.status(500).json({ error: `An Error occured while retrieving data. Err: ${err}` })));
    const task = tasks.find((wantedTask) => wantedTask.id === parseInt(id, 10));

    if (!task) {
      res.status(404).json({ error: `No task with id: '${id}' found` });
    } else {
      tasks.splice(tasks.indexOf(task), 1);
      await fs.promises.writeFile(taskData, JSON.stringify(tasks, null, 2))
        .catch((err) => res.status(500).json({ error: `An Error occured while writing data. Err: ${err}` }));

      res.status(200).json(task);
    }
  } else {
    res.status(403).json({ error: 'Unauthorized to access this Endpoint' });
  }
});

module.exports = router;
