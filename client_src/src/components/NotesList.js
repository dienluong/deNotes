import 'react-ui-tree/dist/react-ui-tree.css';
import './NotesList.css';
import React from 'react';
import Tree from 'react-ui-tree';
import Note from './Note';

const sampleNotes = {
  'module': 'react-ui-tree',
  'children': [
    {
      'module': 'dist',
      'collapsed': true,
      'children': [
        {
          'module': 'node.js',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.css',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.js',
          'leaf': true,
        },
        {
          'module': 'tree.js',
          'leaf': true,
        },
      ],
    },
    {
      'module': 'example',
      'children': [
        {
          'module': 'app.js',
          'leaf': true,
        },
        {
          'module': 'app.less',
          'leaf': true,
        },
        {
          'module': 'index.html',
          'leaf': true,
        },
      ],
    },
    {
      'module': 'lib',
      'children': [
        {
          'module': 'node.js',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.js',
          'leaf': true,
        },
        {
          'module': 'react-ui-tree.less',
          'leaf': true,
        },
        {
          'module': 'tree.js',
          'leaf': true,
        },
      ],
    },
    {
      'module': '.gitiignore',
      'leaf': true,
    },
    {
      'module': 'index.js',
      'leaf': true,
    },
    {
      'module': 'LICENSE',
      'leaf': true,
    },
    {
      'module': 'Makefile',
      'leaf': true,
    },
    {
      'module': 'package.json',
      'leaf': true,
    },
    {
      'module': 'README.md',
      'leaf': true,
    },
    {
      'module': 'webpack.config.js',
      'leaf': true,
    },
  ],
};

class NotesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeNote: null,
      notesTree: sampleNotes,
    };

    this.handleChange = this.handleChange.bind(this);
    this.renderNode = this.renderNode.bind(this);
    this.onClickNode = this.onClickNode.bind(this);
  }

  handleChange(tree) {
    this.setState({
      tree: tree,
    });
  }

  renderNode(node) {
    // console.log(`renderNode called ${node.module}`);
    return (
      <Note
        active={ this.state.activeNote === node }
        clickHandler={ this.onClickNode }
        node={ node }
      />
    );
  }

  onClickNode(node) {
    console.log(`Active Note: ${node.module}`);
    this.setState({
      activeNote: node,
    });
  }

  render() {
    console.log(`rendering NoteLists...`);
    return (<div className='tree'>
      <Tree
        tree={ this.state.notesTree }
        onChange={ this.handleChange }
        isNodeCollapsed={ this.isNodeCollapsed }
        renderNode={ this.renderNode }
      />
    </div>);
  };
}

export default NotesList;
