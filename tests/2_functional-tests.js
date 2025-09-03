const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');

chai.use(chaiHttp);
const expect = chai.expect;

suite('Functional Tests', function() {
    const TEST_PROJECT = 'testproject';
    let testIssueId;

    // Create an issue with every field
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
        chai.request(app)
            .post(`/api/issues/${TEST_PROJECT}`)
            .send({
                issue_title: 'Test Issue',
                issue_text: 'This is a test issue with all fields',
                created_by: 'Tester',
                assigned_to: 'Developer',
                status_text: 'In Progress'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('_id');
                expect(res.body.issue_title).to.equal('Test Issue');
                expect(res.body.issue_text).to.equal('This is a test issue with all fields');
                expect(res.body.created_by).to.equal('Tester');
                expect(res.body.assigned_to).to.equal('Developer');
                expect(res.body.status_text).to.equal('In Progress');
                expect(res.body.open).to.equal(true);
                expect(res.body).to.have.property('created_on');
                expect(res.body).to.have.property('updated_on');
                
                testIssueId = res.body._id;
                done();
            });
    });

    // Create an issue with only required fields
    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
        chai.request(app)
            .post(`/api/issues/${TEST_PROJECT}`)
            .send({
                issue_title: 'Required Only Issue',
                issue_text: 'This is a test issue with only required fields',
                created_by: 'Tester'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('_id');
                expect(res.body.issue_title).to.equal('Required Only Issue');
                expect(res.body.issue_text).to.equal('This is a test issue with only required fields');
                expect(res.body.created_by).to.equal('Tester');
                expect(res.body.assigned_to).to.equal('');
                expect(res.body.status_text).to.equal('');
                expect(res.body.open).to.equal(true);
                done();
            });
    });

    // Create an issue with missing required fields
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
        chai.request(app)
            .post(`/api/issues/${TEST_PROJECT}`)
            .send({
                issue_title: 'Incomplete Issue',
                created_by: 'Tester'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('required field(s) missing');
                done();
            });
    });

    // View issues on a project
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
        chai.request(app)
            .get(`/api/issues/${TEST_PROJECT}`)
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.at.least(2); // At least the two we created
                done();
            });
    });

    // View issues on a project with one filter
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
        chai.request(app)
            .get(`/api/issues/${TEST_PROJECT}`)
            .query({ created_by: 'Tester' })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.at.least(2);
                res.body.forEach(issue => {
                    expect(issue.created_by).to.equal('Tester');
                });
                done();
            });
    });

    // View issues on a project with multiple filters
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
        chai.request(app)
            .get(`/api/issues/${TEST_PROJECT}`)
            .query({ created_by: 'Tester', open: true })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                res.body.forEach(issue => {
                    expect(issue.created_by).to.equal('Tester');
                    expect(issue.open).to.equal(true);
                });
                done();
            });
    });

    // Update one field on an issue
    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
        chai.request(app)
            .put(`/api/issues/${TEST_PROJECT}`)
            .send({
                _id: testIssueId,
                issue_text: 'Updated issue text'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.equal('successfully updated');
                expect(res.body).to.have.property('_id');
                expect(res.body._id).to.equal(testIssueId);
                done();
            });
    });

    // Update multiple fields on an issue
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
        chai.request(app)
            .put(`/api/issues/${TEST_PROJECT}`)
            .send({
                _id: testIssueId,
                assigned_to: 'New Developer',
                status_text: 'Completed',
                open: false
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.equal('successfully updated');
                expect(res.body).to.have.property('_id');
                expect(res.body._id).to.equal(testIssueId);
                done();
            });
    });

    // Update an issue with missing _id
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
        chai.request(app)
            .put(`/api/issues/${TEST_PROJECT}`)
            .send({
                issue_text: 'This should fail'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('missing _id');
                done();
            });
    });

    // Update an issue with no fields to update
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
        chai.request(app)
            .put(`/api/issues/${TEST_PROJECT}`)
            .send({
                _id: testIssueId
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('no update field(s) sent');
                expect(res.body).to.have.property('_id');
                expect(res.body._id).to.equal(testIssueId);
                done();
            });
    });

    // Update an issue with an invalid _id
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
        chai.request(app)
            .put(`/api/issues/${TEST_PROJECT}`)
            .send({
                _id: 'invalid_id',
                issue_text: 'This should fail'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('could not update');
                expect(res.body).to.have.property('_id');
                expect(res.body._id).to.equal('invalid_id');
                done();
            });
    });

    // Delete an issue
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
        chai.request(app)
            .delete(`/api/issues/${TEST_PROJECT}`)
            .send({
                _id: testIssueId
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('result');
                expect(res.body.result).to.equal('successfully deleted');
                expect(res.body).to.have.property('_id');
                expect(res.body._id).to.equal(testIssueId);
                done();
            });
    });

    // Delete an issue with an invalid _id
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
        chai.request(app)
            .delete(`/api/issues/${TEST_PROJECT}`)
            .send({
                _id: 'invalid_id'
            })
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('could not delete');
                expect(res.body).to.have.property('_id');
                expect(res.body._id).to.equal('invalid_id');
                done();
            });
    });

    // Delete an issue with missing _id
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
        chai.request(app)
            .delete(`/api/issues/${TEST_PROJECT}`)
            .send({})
            .end(function(err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('missing _id');
                done();
            });
    });
});
