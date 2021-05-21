import React, { Component } from 'react';
import { metadata, utils } from '@ohif/core';

import ConnectedViewer from './ConnectedViewer.js';
import PropTypes from 'prop-types';
import { extensionManager } from './../App.js';
import Dropzone from 'react-dropzone';
import filesToStudies from '../lib/filesToStudies';
import './ViewerLocalFileData.css';
import { withTranslation } from 'react-i18next';

const { OHIFStudyMetadata } = metadata;
const { studyMetadataManager } = utils;
const { readdirSync } = require('fs');
const dropZoneLinkDialog = (onDrop, i18n, dir) => {
  return (
    <Dropzone onDrop={onDrop} noDrag>
      {({ getRootProps, getInputProps }) => (
        <span {...getRootProps()} className="link-dialog">
          {dir ? (
            <span>
              {i18n('Load folders')}
              <input
                {...getInputProps()}
                webkitdirectory="true"
                mozdirectory="true"
              />
            </span>
          ) : (
              <span>
                {i18n('Load files')}
                <input {...getInputProps()} />
              </span>
            )}
        </span>
      )}
    </Dropzone>
  );
};

const linksDialogMessage = (onDrop, i18n) => {
  return (
    <>
      {i18n('Or click to ')}
      {dropZoneLinkDialog(onDrop, i18n)}
      {i18n(' or ')}
      {dropZoneLinkDialog(onDrop, i18n, true)}
      {i18n(' from dialog')}
    </>
  );
};

class ViewerJsonLocal extends Component {
  static propTypes = {
    studies: PropTypes.array,
  };

  state = {
    studies: null,
    loading: false,
    error: null,
  };

  updateStudies = studies => {
    studyMetadataManager.purge();

    const updatedStudies = studies.map(study => {
      const studyMetadata = new OHIFStudyMetadata(
        study,
        study.StudyInstanceUID
      );
      const sopClassHandlerModules =
        extensionManager.modules['sopClassHandlerModule'];

      study.displaySets =
        study.displaySets ||
        studyMetadata.createDisplaySets(sopClassHandlerModules);
      studyMetadata.setDisplaySets(study.displaySets);

      studyMetadata.forEachDisplaySet(displayset => {
        displayset.localFile = true;
      });

      studyMetadataManager.add(studyMetadata);

      return study;
    });

    this.setState({
      studies: updatedStudies,
    });
  };

  firstRender = false;

  render() {
    const onDrop = async acceptedFiles => { };

    if (this.state.error) {
      return <div>Error: {JSON.stringify(this.state.error)}</div>;
    }

    if (!this.firstRender) { // start loading files
      this.firstRender = true;
      this.setState({ loading: true });
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const jsonUrl = urlParams.get('url')

      async function createFile() {
        let urlListResponse = await fetch(jsonUrl, {
          mode: 'no-cors'
        });
        let dicomUrlArray = await urlListResponse.json();

        async function getFile(url) {
          let filename = url.substring(url.lastIndexOf('/') + 1);
          let response = await fetch(url, {
            mode: 'no-cors'
          });
          return response.blob().then(function (data) {
            let file = new File([data], filename);
            return file;
          });
        }

        let promises = [];
        for (const key in dicomUrlArray) {
          if (dicomUrlArray.hasOwnProperty(key)) {
            const url = dicomUrlArray[key];
            promises.push(getFile(url));
          }
        }
        return Promise.all(promises);
      }
      var that = this;
      createFile().then(async function (result) {
        const studies = await filesToStudies(result);
        const updatedStudies = that.updateStudies(studies);

        if (!updatedStudies) {
          return;
        }
        that.setState({ studies: updatedStudies, loading: false });
      })
    }


    return (
      <Dropzone onDrop={onDrop} noClick>
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} style={{ width: '100%', height: '100%' }}>
            {this.state.studies ? (
              <ConnectedViewer
                studies={this.state.studies}
                studyInstanceUIDs={
                  this.state.studies &&
                  this.state.studies.map(a => a.StudyInstanceUID)
                }
              />
            ) : (
                <div className={'drag-drop-instructions'}>
                  <div className={'drag-drop-contents'}>
                    {this.state.loading ? (
                      <h3>{this.props.t('Loading...')}</h3>
                    ) : (
                        <>
                          <h3>
                            {this.props.t(
                              'Something went wrong, please retry'
                            )}
                          </h3>
                          <h4>{linksDialogMessage(onDrop, this.props.t)}</h4>
                        </>
                      )}
                  </div>
                </div>
              )}
          </div>
        )}
      </Dropzone>
    );
  }
}

export default withTranslation('Common')(ViewerJsonLocal);
