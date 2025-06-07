import { h, Fragment } from 'preact';
import LinkedLogo from './components/LinkedLogo';
import { Match } from 'preact-router/match';
import { memo } from 'preact/compat';
import { ENV } from './env';
import { useMemo } from 'preact/hooks'
import useSWR from 'swr';
import NavigationDrawer, { Destination, Separator } from './components/NavigationDrawer';

export default function Sidebar() {
  const { data: config } = useSWR('config');

  const sortedCameras = useMemo(() => {
    if (!config) {
      return [];
    }

    return Object.entries(config.cameras)
      .filter(([_, conf]) => conf.ui.dashboard)
      .sort(([_, aConf], [__, bConf]) => aConf.ui.order - bConf.ui.order);
  }, [config]);

  if (!config) {
    return null;
  }
  const { birdseye } = config;

  return (
    <NavigationDrawer header={<Header />}>
      <Destination href="/" text="摄像头" />
      <Match path="/cameras/:camera/:other?">
        {({ matches }) =>
          matches ? (
            <CameraSection sortedCameras={sortedCameras} />
          ) : null
        }
      </Match>
      <Match path="/recording/:camera/:date?/:hour?/:seconds?">
        {({ matches }) =>
          matches ? (
            <RecordingSection sortedCameras={sortedCameras} />
          ) : null
        }
      </Match>
      {birdseye?.enabled ? <Destination href="/birdseye" text="概览" /> : null}
      <Destination href="/events" text="事件" />
      <Destination href="/exports" text="导出" />
      <Separator />
      <Destination href="/storage" text="存储" />
      <Destination href="/system" text="系统" />
      <Destination href="/config" text="配置" />
      <Destination href="/logs" text="日志" />
      <Separator />
      <div className="flex flex-grow" />
      {ENV !== 'production' ? (
        <Fragment>
          <Destination href="/styleguide" text="主题设置" />
          <Separator />
        </Fragment>
      ) : null}
      {/* <Destination className="self-end" href="https://docs.frigate.video" text="Documentation" /> */}
      {/* <Destination className="self-end" href="https://github.com/blakeblackshear/frigate" text="GitHub" /> */}
    </NavigationDrawer>
  );
}

function CameraSection({ sortedCameras }) {

  return (
    <Fragment>
      <Separator />
      <div className="overflow-auto pr-2">
        {sortedCameras.map(([camera]) => (
          <Destination key={camera} href={`/cameras/${camera}`} text={camera.replaceAll('_', ' ')} />
        ))}   
      </div>
      <Separator />
    </Fragment>
  );
}

function RecordingSection({ sortedCameras }) {

  return (
    <Fragment>
      <Separator />
      <div className="overflow-auto pr-2">
        {sortedCameras.map(([camera, _]) => {
          return (
            <Destination
              key={camera}
              path={`/recording/${camera}/:date?/:hour?/:seconds?`}
              href={`/recording/${camera}`}
              text={camera.replaceAll('_', ' ')}
            />
          );
        })}
      </div>
      <Separator />
    </Fragment>
  );
}

const Header = memo(() => {
  return (
    <div className="text-gray-500">
      <LinkedLogo />
    </div>
  );
});