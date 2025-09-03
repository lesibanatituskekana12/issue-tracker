document.addEventListener('DOMContentLoaded', function() {
    // Create Issue Form
    const issueForm = document.getElementById('issue-form');
    issueForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const project = document.getElementById('project').value;
        const formData = new FormData(issueForm);
        const data = {};
        
        formData.forEach((value, key) => {
            if (value) data[key] = value;
        });
        
        fetch(`/api/issues/${project}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.getElementById('create-response');
            if (data.error) {
                responseDiv.className = 'response error';
                responseDiv.innerHTML = `<strong>Error:</strong> ${data.error}`;
            } else {
                responseDiv.className = 'response success';
                responseDiv.innerHTML = `<strong>Success:</strong> Issue created with ID: ${data._id}`;
                issueForm.reset();
            }
        })
        .catch(error => {
            const responseDiv = document.getElementById('create-response');
            responseDiv.className = 'response error';
            responseDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
        });
    });
    
    // View Issues Form
    const viewForm = document.getElementById('view-form');
    viewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const project = document.getElementById('view-project').value;
        const formData = new FormData(viewForm);
        const params = new URLSearchParams();
        
        formData.forEach((value, key) => {
            if (value && key !== 'project') params.append(key, value);
        });
        
        fetch(`/api/issues/${project}?${params}`)
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.getElementById('view-response');
            const issuesList = document.getElementById('issues-list');
            
            if (data.error) {
                responseDiv.className = 'response error';
                responseDiv.innerHTML = `<strong>Error:</strong> ${data.error}`;
                issuesList.innerHTML = '';
            } else {
                responseDiv.className = 'response success';
                responseDiv.innerHTML = `<strong>Success:</strong> Found ${data.length} issues`;
                
                if (data.length === 0) {
                    issuesList.innerHTML = '<p>No issues found</p>';
                } else {
                    issuesList.innerHTML = data.map(issue => `
                        <div class="issue ${issue.open ? '' : 'closed'}">
                            <h4>${issue.issue_title} (ID: ${issue._id})</h4>
                            <p><strong>Description:</strong> ${issue.issue_text}</p>
                            <p><strong>Created by:</strong> ${issue.created_by}</p>
                            ${issue.assigned_to ? `<p><strong>Assigned to:</strong> ${issue.assigned_to}</p>` : ''}
                            ${issue.status_text ? `<p><strong>Status:</strong> ${issue.status_text}</p>` : ''}
                            <p><strong>Open:</strong> ${issue.open ? 'Yes' : 'No'}</p>
                            <div class="meta">
                                <p>Created: ${new Date(issue.created_on).toLocaleString()}</p>
                                <p>Updated: ${new Date(issue.updated_on).toLocaleString()}</p>
                            </div>
                        </div>
                    `).join('');
                }
            }
        })
        .catch(error => {
            const responseDiv = document.getElementById('view-response');
            responseDiv.className = 'response error';
            responseDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
        });
    });
    
    // Update Issue Form
    const updateForm = document.getElementById('update-form');
    updateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const project = document.getElementById('update-project').value;
        const formData = new FormData(updateForm);
        const data = {};
        
        formData.forEach((value, key) => {
            if (value && key !== 'project') data[key] = value;
        });
        
        // Remove empty fields
        Object.keys(data).forEach(key => {
            if (data[key] === '') delete data[key];
        });
        
        fetch(`/api/issues/${project}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.getElementById('update-response');
            if (data.error) {
                responseDiv.className = 'response error';
                responseDiv.innerHTML = `<strong>Error:</strong> ${data.error}`;
            } else {
                responseDiv.className = 'response success';
                responseDiv.innerHTML = `<strong>Success:</strong> ${data.result}`;
                updateForm.reset();
            }
        })
        .catch(error => {
            const responseDiv = document.getElementById('update-response');
            responseDiv.className = 'response error';
            responseDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
        });
    });
    
    // Delete Issue Form
    const deleteForm = document.getElementById('delete-form');
    deleteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const project = document.getElementById('delete-project').value;
        const id = document.getElementById('delete-id').value;
        
        fetch(`/api/issues/${project}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: id })
        })
        .then(response => response.json())
        .then(data => {
            const responseDiv = document.getElementById('delete-response');
            if (data.error) {
                responseDiv.className = 'response error';
                responseDiv.innerHTML = `<strong>Error:</strong> ${data.error}`;
            } else {
                responseDiv.className = 'response success';
                responseDiv.innerHTML = `<strong>Success:</strong> ${data.result}`;
                deleteForm.reset();
            }
        })
        .catch(error => {
            const responseDiv = document.getElementById('delete-response');
            responseDiv.className = 'response error';
            responseDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
        });
    });
});
