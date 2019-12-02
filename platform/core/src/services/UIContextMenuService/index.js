/**
 * UI Context Menu
 *
 * @typedef {Object} ContextMenuProps
 * @property {Event} event The event with tool information.
 */

/**
 * UI Labelling Flow
 *
 * @typedef {Object} LabellingFlowProps
 * @property {Object} defaultPosition The position of the labelling dialog.
 * @property {boolean} centralize conditional to center the labelling dialog.
 * @property {Object} props The labelling props.
 *
 */

const uiContextMenuServicePublicAPI = {
  name: 'UIContextMenuService',
  showLabellingFlow,
  hideContextMenu,
  showContextMenu,
  setServiceImplementation,
};

const uiContextMenuServiceImplementation = {
  _showLabellingFlow: () => console.warn('showLabellingFlow() NOT IMPLEMENTED'),
  _hideContextMenu: () => console.warn('hideContextMenu() NOT IMPLEMENTED'),
  _showContextMenu: () => console.warn('showLabellingFlow() NOT IMPLEMENTED'),
};

function createUIContextMenuService() {
  return uiContextMenuServicePublicAPI;
}

/**
 * Show a new UI ContextMenu;
 *
 * @param {ContextMenuProps} props { event }
 */
function showContextMenu({ event }) {
  return uiContextMenuServiceImplementation._showContextMenu({
    event,
  });
}

/**
 * Hide a UI ContextMenu;
 *
 */
function hideContextMenu() {
  return uiContextMenuServiceImplementation._hideContextMenu();
}

/**
 * Show a new UI LabellingFlow;
 *
 * @param {LabellingFlowProps} props { defaultPosition, centralize, props }
 */
function showLabellingFlow({ defaultPosition, centralize, props }) {
  return uiContextMenuServiceImplementation._showLabellingFlow({
    defaultPosition,
    centralize,
    props,
  });
}

/**
 *
 *
 * @param {*} {
 *   showContextMenu: showContextMenuImplementation,
 *   hideContextMenu: hideContextMenuImplementation,
 *   showLabellingFlow: showLabellingFlowImplementation,
 * }
 */
function setServiceImplementation({
  showContextMenu: showContextMenuImplementation,
  hideContextMenu: hideContextMenuImplementation,
  showLabellingFlow: showLabellingFlowImplementation,
}) {
  if (showContextMenuImplementation) {
    uiContextMenuServiceImplementation._showContextMenu = showContextMenuImplementation;
  }
  if (hideContextMenuImplementation) {
    uiContextMenuServiceImplementation._hideContextMenu = hideContextMenuImplementation;
  }
  if (showLabellingFlowImplementation) {
    uiContextMenuServiceImplementation._showLabellingFlow = showLabellingFlowImplementation;
  }
}

export default createUIContextMenuService;