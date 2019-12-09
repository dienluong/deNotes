import Widget from 'remotestorage-widget';
import RemoteStorage from 'remotestoragejs';

// Types
type RemoteStorageT = typeof RemoteStorage;

const options = {
  leaveOpen: false,
  autoCloseAfter: 1500,
  skipInitial: true,
  logging: false,
};

export function connect({ storage }: { storage: RemoteStorageT  }) {
  if (storage) {
    storage.setApiKeys({
      dropbox: process.env.REACT_APP_DROPBOX_APPKEY,
    });
    const widget = new Widget(storage, options);
    return {
      storage,
      widget,
    }
  } else {
    return null;
  }
}
