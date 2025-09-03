const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { issuesCollection } = require('../server');

// Helper function to get issues for a project
const getProjectIssues = async (project) => {
  return await issuesCollection.find({ project }).toArray();
};

// POST /api/issues/{project}
router.post('/:project', async (req, res) => {
  const project = req.params.project;
  const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
  
  // Check required fields
  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }
  
  const now = new Date();
  const newIssue = {
    project,
    issue_title,
    issue_text,
    created_by,
    assigned_to: assigned_to || '',
    status_text: status_text || '',
    open: true,
    created_on: now,
    updated_on: now
  };
  
  try {
    const result = await issuesCollection.insertOne(newIssue);
    newIssue._id = result.insertedId;
    res.json(newIssue);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/issues/{project}
router.get('/:project', async (req, res) => {
  const project = req.params.project;
  
  // Build query with filters
  const query = { project };
  const filters = { ...req.query };
  delete filters.project; // Remove project from filters
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== '') {
      // Handle boolean conversion for 'open' field
      if (key === 'open') {
        query[key] = filters[key] === 'true';
      } else {
        query[key] = filters[key];
      }
    }
  });
  
  try {
    const projectIssues = await issuesCollection.find(query).toArray();
    res.json(projectIssues);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/issues/{project}
router.put('/:project', async (req, res) => {
  const project = req.params.project;
  const { _id, ...updateFields } = req.body;
  
  // Check for _id
  if (!_id) {
    return res.json({ error: 'missing _id' });
  }
  
  // Check for update fields
  if (Object.keys(updateFields).length === 0) {
    return res.json({ error: 'no update field(s) sent', _id });
  }
  
  // Prepare update document
  const updateDoc = { $set: {} };
  Object.keys(updateFields).forEach(key => {
    if (updateFields[key] !== '') {
      // Handle boolean conversion for 'open' field
      if (key === 'open') {
        updateDoc.$set[key] = (updateFields[key] === 'true');
      } else {
        updateDoc.$set[key] = updateFields[key];
      }
    }
  });
  
  // Add updated_on field
  updateDoc.$set.updated_on = new Date();
  
  try {
    const result = await issuesCollection.updateOne(
      { _id: new ObjectId(_id), project },
      updateDoc
    );
    
    if (result.matchedCount === 0) {
      return res.json({ error: 'could not update', _id });
    }
    
    res.json({ result: 'successfully updated', _id });
  } catch (error) {
    res.json({ error: 'could not update', _id });
  }
});

// DELETE /api/issues/{project}
router.delete('/:project', async (req, res) => {
  const project = req.params.project;
  const { _id } = req.body;
  
  // Check for _id
  if (!_id) {
    return res.json({ error: 'missing _id' });
  }
  
  try {
    const result = await issuesCollection.deleteOne({ _id: new ObjectId(_id), project });
    
    if (result.deletedCount === 0) {
      return res.json({ error: 'could not delete', _id });
    }
    
    res.json({ result: 'successfully deleted', _id });
  } catch (error) {
    res.json({ error: 'could not delete', _id });
  }
});

module.exports = router;
