import { h, Fragment } from 'preact';
import ActivityIndicator from '../components/ActivityIndicator';
import Heading from '../components/Heading';
import { useWs } from '../api/ws';
import useSWR from 'swr';
import { Table, Tbody, Thead, Tr, Th, Td } from '../components/Table';
import Link from '../components/Link';
import Button from '../components/Button';
import { About } from '../icons/About';

const emptyObject = Object.freeze({});

export default function Storage() {
  const { data: storage } = useSWR('recordings/storage');

  const {
    value: { payload: stats },
  } = useWs('stats');
  const { data: initialStats } = useSWR('stats');

  const { service } = stats || initialStats || emptyObject;

  if (!service || !storage) {
    return <ActivityIndicator />;
  }

  const getUnitSize = (MB) => {
    if (isNaN(MB) || MB < 0) return 'Invalid number';
    if (MB < 1024) return `${MB} MiB`;
    if (MB < 1048576) return `${(MB / 1024).toFixed(2)} GiB`;

    return `${(MB / 1048576).toFixed(2)} TiB`;
  };

  let storage_usage;
  if (
    service &&
    service['storage']['/media/frigate/recordings']['total'] != service['storage']['/media/frigate/clips']['total']
  ) {
    storage_usage = (
      <Fragment>
        <Tr>
          <Td>Recordings</Td>
          <Td>{getUnitSize(service['storage']['/media/frigate/recordings']['used'])}</Td>
          <Td>{getUnitSize(service['storage']['/media/frigate/recordings']['total'])}</Td>
        </Tr>
        <Tr>
          <Td>Snapshots</Td>
          <Td>{getUnitSize(service['storage']['/media/frigate/clips']['used'])}</Td>
          <Td>{getUnitSize(service['storage']['/media/frigate/clips']['total'])}</Td>
        </Tr>
      </Fragment>
    );
  } else {
    storage_usage = (
      <Fragment>
        <Tr>
          <Td>Recordings & Snapshots</Td>
          <Td>{getUnitSize(service['storage']['/media/frigate/recordings']['used'])}</Td>
          <Td>{getUnitSize(service['storage']['/media/frigate/recordings']['total'])}</Td>
        </Tr>
      </Fragment>
    );
  }

  return (
    <div className="space-y-4 p-2 px-4">
      <Heading>存储</Heading>

      <Fragment>
        <Heading size="lg">概览</Heading>
        <div data-testid="overview-types" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow">
            <div className="flex justify-start">
              <div className="text-lg flex justify-between p-4">数据</div>
              <Button
                className="rounded-full"
                type="text"
                color="gray"
                aria-label="录像与快照目录所在驱动器的已用存储及总容量概览。"
              >
                <About className="w-5" />
              </Button>
            </div>
            <div className="p-2">
              <Table className="w-full">
                <Thead>
                  <Tr>
                    <Th>位置</Th>
                    <Th>已用</Th>
                    <Th>总计</Th>
                  </Tr>
                </Thead>
                <Tbody>{storage_usage}</Tbody>
              </Table>
            </div>
          </div>
          <div className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow">
            <div className="flex justify-start">
              <div className="text-lg flex justify-between p-4">内存</div>
              <Button
                className="rounded-full"
                type="text"
                color="gray"
                aria-label="Frigate进程的已用及总内存概览。"
              >
                <About className="w-5" />
              </Button>
            </div>
            <div className="p-2">
              <Table className="w-full">
                <Thead>
                  <Tr>
                    <Th>位置</Th>
                    <Th>已用</Th>
                    <Th>总计</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>/dev/shm</Td>
                    <Td>{getUnitSize(service['storage']['/dev/shm']['used'])}</Td>
                    <Td>{getUnitSize(service['storage']['/dev/shm']['total'])}</Td>
                  </Tr>
                  <Tr>
                    <Td>/tmp/cache</Td>
                    <Td>{getUnitSize(service['storage']['/tmp/cache']['used'])}</Td>
                    <Td>{getUnitSize(service['storage']['/tmp/cache']['total'])}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Heading size="lg">摄像头</Heading>
          <Button
            className="rounded-full"
            type="text"
            color="gray"
            aria-label="各摄像头的存储占用及带宽使用概览。"
          >
            <About className="w-5" />
          </Button>
        </div>
        <div data-testid="detectors" className="grid grid-cols-1 3xl:grid-cols-3 md:grid-cols-2 gap-4">
          {Object.entries(storage).map(([name, camera]) => (
            <div key={name} className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow">
              <div className="capitalize text-lg flex justify-between p-4">
                <Link href={`/cameras/${name}`}>{name.replaceAll('_', ' ')}</Link>
              </div>
              <div className="p-2">
                <Table className="w-full">
                  <Thead>
                    <Tr>
                      <Th>使用率</Th>
                      <Th>流带宽</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>{Math.round(camera['usage_percent'] ?? 0)}%</Td>
                      <Td>{camera['bandwidth'] ? `${getUnitSize(camera['bandwidth'])}/hr` : 'Calculating...'}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    </div>
  );
}
