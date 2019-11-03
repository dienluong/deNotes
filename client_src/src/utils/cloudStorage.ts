import Widget from 'remotestorage-widget';
import RemoteStorage from 'remotestoragejs';

// Types
type RemoteStorageT = typeof RemoteStorage;

export default function ({ baseStorage }: { baseStorage: RemoteStorageT  }) {
  if (baseStorage) {
    const widget = new Widget(baseStorage);
    baseStorage.setApiKeys({
      dropbox: process.env.REACT_APP_DROPBOX_APPKEY,
    });
    return widget;
  } else {
    return null;
  }
}
