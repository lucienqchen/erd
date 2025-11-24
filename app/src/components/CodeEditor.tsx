import { FC, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import './CodeEditor.css';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  theme?: 'vs-dark' | 'vs-light';
  readOnly?: boolean;
}

export const CodeEditor: FC<CodeEditorProps> = ({
  value = '',
  onChange,
  language = 'sql',
  theme = 'vs-dark',
  readOnly = false,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;

    // Register DBML syntax (SQL-like for now)
    monaco.languages.register({ id: 'dbml' });
    monaco.languages.setMonarchTokensProvider('dbml', {
      keywords: [
        'Table',
        'Ref',
        'Enum',
        'Project',
        'pk',
        'null',
        'not null',
        'unique',
        'increment',
        'default',
        'varchar',
        'int',
        'integer',
        'text',
        'timestamp',
        'boolean',
        'date',
      ],
      tokenizer: {
        root: [
          [
            /[a-z_$][\w$]*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            },
          ],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment'],
        ],
      },
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange?.(value);
  };

  return (
    <div className="code-editor-wrapper">
      <Editor
        height="100%"
        defaultLanguage={language === 'dbml' ? 'dbml' : language}
        language={language === 'dbml' ? 'dbml' : language}
        value={value}
        theme={theme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};