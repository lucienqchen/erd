import { FC, useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import './EditorPage.css';

const defaultDBML = `// Define your database schema using DBML

Table users {
  id integer [pk, increment]
  username varchar(255) [unique, not null]
  email varchar(255) [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table posts {
  id integer [pk, increment]
  user_id integer [not null]
  title varchar(255) [not null]
  content text
  created_at timestamp [default: \`now()\`]
}

Table comments {
  id integer [pk, increment]
  post_id integer [not null]
  user_id integer [not null]
  content text [not null]
  created_at timestamp [default: \`now()\`]
}

// Define relationships
Ref: posts.user_id > users.id
Ref: comments.post_id > posts.id
Ref: comments.user_id > users.id
`;

export const EditorPage: FC = () => {
  const [code, setCode] = useState<string>(defaultDBML);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
  };

  const handleClear = () => {
    setCode('');
  };

  const handleExport = () => {
    // Create a blob with the content
    const blob = new Blob([code], { type: 'text/markdown' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `database-schema-${timestamp}.md`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>DBML Editor</h2>
        <div className="editor-actions">
          <button className="btn-secondary" onClick={handleClear}>Clear</button>
          <button className="btn-primary" onClick={handleExport}>Export</button>
        </div>
      </div>

      <div className="editor-content">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language="dbml"
          theme="vs-light"
        />
      </div>
    </div>
  );
};