import React from 'react';

const Education = () => {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">🎓 Education & Skills</h1>
        <button className="btn-primary">Enroll PDL</button>
      </div>

      <div className="section">
        <h2>Active ALS Students</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Juan Dela Cruz</td>
              <td>Elementary</td>
              <td>Ongoing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section" style={{ marginTop: '30px' }}>
        <h2>TESDA Trainees</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Course</th>
              <th>Assessment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pedro Penduko</td>
              <td>Shielded Metal Arc Welding (NC II)</td>
              <td>Passed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Education;