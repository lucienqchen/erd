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

  return (
    <div className="editor-page">
      <div className="editor-header">
        <h2>DBML Editor</h2>
        <div className="editor-actions">
          <button className="btn-secondary">Clear</button>
          <button className="btn-primary">Export</button>
        </div>
      </div>

      <div className="editor-content">
        <CodeEditor
          value={code}
          onChange={handleCodeChange}
          language="dbml"
          theme="vs-dark"
        />
      </div>
    </div>
  );
};