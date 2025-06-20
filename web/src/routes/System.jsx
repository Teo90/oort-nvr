import { h, Fragment } from 'preact';
import ActivityIndicator from '../components/ActivityIndicator';
import Button from '../components/Button';
import Heading from '../components/Heading';
import Link from '../components/Link';
import { useWs } from '../api/ws';
import useSWR from 'swr';
import axios from 'axios';
import { Table, Tbody, Thead, Tr, Th, Td } from '../components/Table';
import { useState } from 'preact/hooks';
import Dialog from '../components/Dialog';
import TimeAgo from '../components/TimeAgo';
import copy from 'copy-to-clipboard';
import { About } from '../icons/About';
import { WebUI } from '../icons/WebUI';

const emptyObject = Object.freeze({});

export default function System() {
  const [state, setState] = useState({ showFfprobe: false, ffprobe: '' });
  const { data: config } = useSWR('config');

  const {
    value: { payload: stats },
  } = useWs('stats');
  const { data: initialStats } = useSWR('stats');

  const {
    cpu_usages,
    gpu_usages,
    bandwidth_usages,
    detectors,
    service = {},
    detection_fps: _,
    processes,
    cameras,
  } = stats || initialStats || emptyObject;

  const detectorNames = Object.keys(detectors || emptyObject);
  const gpuNames = Object.keys(gpu_usages || emptyObject);
  const cameraNames = Object.keys(cameras || emptyObject);
  const processesNames = Object.keys(processes || emptyObject);

  const { data: go2rtc } = useSWR('go2rtc/api');

  const onHandleFfprobe = async (camera, e) => {
    if (e) {
      e.stopPropagation();
    }

    setState({ ...state, showFfprobe: true });
    const response = await axios.get('ffprobe', {
      params: {
        paths: `camera:${camera}`,
      },
    });

    if (response.status === 200) {
      setState({ ...state, showFfprobe: true, ffprobe: response.data });
    } else {
      setState({ ...state, showFfprobe: true, ffprobe: 'There was an error getting the ffprobe output.' });
    }
  };

  const onCopyFfprobe = async () => {
    copy(JSON.stringify(state.ffprobe).replace(/[\\\s]+/gi, ''));
    setState({ ...state, ffprobe: '', showFfprobe: false });
  };

  const onHandleVainfo = async (e) => {
    if (e) {
      e.stopPropagation();
    }

    const response = await axios.get('vainfo');

    if (response.status === 200) {
      setState({
        ...state,
        showVainfo: true,
        vainfo: response.data,
      });
    } else {
      setState({ ...state, showVainfo: true, vainfo: 'There was an error getting the vainfo output.' });
    }
  };

  const onCopyVainfo = async () => {
    copy(JSON.stringify(state.vainfo).replace(/[\\\s]+/gi, ''));
    setState({ ...state, vainfo: '', showVainfo: false });
  };

  return (
    <div className="space-y-4 p-2 px-4">
      <div className="flex justify-between">
        <Heading>
          系统 <span className="text-sm">{service.version}</span>
        </Heading>
        {config && (
          <span class="p-1">
            go2rtc {go2rtc && `${go2rtc.version} `}
            <Link
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              href="/api/go2rtc/streams"
            >
              流信息
            </Link>
          </span>
        )}
      </div>

      {service.last_updated && (
        <p>
          <span>
            最后刷新: <TimeAgo time={service.last_updated * 1000} dense />
          </span>
        </p>
      )}

      {state.showFfprobe && (
        <Dialog>
          <div className="p-4 mb-2 max-h-96 whitespace-pre-line overflow-auto">
            <Heading size="lg">Ffprobe 输出</Heading>
            {state.ffprobe != '' ? (
              <div>
                {state.ffprobe.map((stream, idx) => (
                  <div key={idx} className="mb-2 max-h-96 whitespace-pre-line">
                    <div>流 {idx}:</div>
                    <div className="px-2">返回代码：{stream.return_code}</div>
                    <br />
                    {stream.return_code == 0 ? (
                      <div>
                        {stream.stdout.streams.map((codec, idx) => (
                          <div className="px-2" key={idx}>
                            {codec.width ? (
                              <div>
                                <div>视频流：</div>
                                <br />
                                <div>编解码器：{codec.codec_long_name}</div>
                                <div>
                                  分辨率：{codec.width}x{codec.height}
                                </div>
                                <div>帧率：{codec.avg_frame_rate == '0/0' ? '未知' : codec.avg_frame_rate}</div>
                                <br />
                              </div>
                            ) : (
                              <div>
                                <div>音频流：</div>
                                <br />
                                <div>编解码器：{codec.codec_long_name}</div>
                                <br />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-2">
                        <div>错误: {stream.stderr}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ActivityIndicator />
            )}
          </div>
          <div className="p-2 flex justify-start flex-row-reverse space-x-2">
            <Button className="ml-2" onClick={() => onCopyFfprobe()} type="text">
              复制
            </Button>
            <Button
              className="ml-2"
              onClick={() => setState({ ...state, ffprobe: '', showFfprobe: false })}
              type="text"
            >
              关闭
            </Button>
          </div>
        </Dialog>
      )}

      {state.showVainfo && (
        <Dialog>
          <div className="p-4 overflow-auto whitespace-pre-line">
            <Heading size="lg">Vainfo 输出</Heading>
            {state.vainfo != '' ? (
              <div className="mb-2 max-h-96 whitespace-pre-line">
                <div className="">返回代码： {state.vainfo.return_code}</div>
                <br />
                <div className="">进程 {state.vainfo.return_code == 0 ? '输出' : '错误'}:</div>
                <br />
                <div>{state.vainfo.return_code == 0 ? state.vainfo.stdout : state.vainfo.stderr}</div>
              </div>
            ) : (
              <ActivityIndicator />
            )}
          </div>
          <div className="p-2 flex justify-start flex-row-reverse space-x-2 whitespace-pre-wrap">
            <Button className="ml-2" onClick={() => onCopyVainfo()} type="text">
              复制
            </Button>
            <Button className="ml-2" onClick={() => setState({ ...state, vainfo: '', showVainfo: false })} type="text">
              关闭
            </Button>
          </div>
        </Dialog>
      )}

      {!detectors ? (
        <div>
          <ActivityIndicator />
        </div>
      ) : (
        <Fragment>
          <div className="flex justify-start">
            <Heading className="self-center" size="lg">
              检测器
            </Heading>
            <Button
              className="rounded-full"
              type="text"
              color="gray"
              aria-label="控制目标检测器的各进程瞬时资源占用（CPU%为单核占用率）"
            >
              <About className="w-5" />
            </Button>
          </div>
          <div data-testid="detectors" className="grid grid-cols-1 3xl:grid-cols-3 md:grid-cols-2 gap-4">
            {detectorNames.map((detector) => (
              <div key={detector} className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow">
                <div className="text-lg flex justify-between p-4">{detector}</div>
                <div className="p-2">
                  <Table className="w-full">
                    <Thead>
                      <Tr>
                        <Th>进程ID</Th>
                        <Th>推理速度</Th>
                        <Th>CPU占用</Th>
                        <Th>内存占用</Th>
                        {config.telemetry.network_bandwidth && <Th>Network Bandwidth</Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{detectors[detector]['pid']}</Td>
                        <Td>{detectors[detector]['inference_speed']} ms</Td>
                        <Td>{cpu_usages[detectors[detector]['pid']]?.['cpu'] || '- '}%</Td>
                        <Td>{cpu_usages[detectors[detector]['pid']]?.['mem'] || '- '}%</Td>
                        {config.telemetry.network_bandwidth && (
                          <Td>{bandwidth_usages[detectors[detector]['pid']]?.['bandwidth'] || '- '}KB/s</Td>
                        )}
                      </Tr>
                    </Tbody>
                  </Table>
                </div>
              </div>
            ))}
          </div>

          <div className="text-lg flex justify-between">
            <div className="flex justify-start">
              <Heading className="self-center" size="lg">
                GPUs
              </Heading>
              <Button
                className="rounded-full"
                type="text"
                color="gray"
                aria-label="各GPU的瞬时资源占用（Intel显卡不支持显存统计）"
              >
                <About className="w-5" />
              </Button>
            </div>
            <Button onClick={(e) => onHandleVainfo(e)}>vainfo</Button>
          </div>

          {!gpu_usages ? (
            <div className="p-4">
              <Link href={'https://docs.frigate.video/configuration/hardware_acceleration'}>
                硬件加速尚未设置，请查看文档以设置硬件加速。
              </Link>
            </div>
          ) : (
            <div data-testid="gpus" className="grid grid-cols-1 3xl:grid-cols-3 md:grid-cols-2 gap-4">
              {gpuNames.map((gpu) => (
                <div key={gpu} className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow">
                  <div className="text-lg flex justify-between p-4">{gpu}</div>
                  <div className="p-2">
                    {gpu_usages[gpu]['gpu'] == -1 ? (
                      <div className="p-4">
                        There was an error getting usage stats. This does not mean hardware acceleration is not working.
                        Either your GPU does not support this or Frigate does not have proper access to get statistics.
                        This is expected for the Home Assistant addon.
                      </div>
                    ) : (
                      <Table className="w-full">
                        <Thead>
                          <Tr>
                            <Th>GPU %</Th>
                            <Th>Memory %</Th>
                            {'dec' in gpu_usages[gpu] && <Th>Decoder %</Th>}
                            {'enc' in gpu_usages[gpu] && <Th>Encoder %</Th>}
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td>{gpu_usages[gpu]['gpu']}</Td>
                            <Td>{gpu_usages[gpu]['mem']}</Td>
                            {'dec' in gpu_usages[gpu] && <Td>{gpu_usages[gpu]['dec']}</Td>}
                            {'enc' in gpu_usages[gpu] && <Td>{gpu_usages[gpu]['enc']}</Td>}
                          </Tr>
                        </Tbody>
                      </Table>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-start">
            <Heading className="self-center" size="lg">
              摄像头
            </Heading>
            <Button
              className="rounded-full"
              type="text"
              color="gray"
              aria-label="与摄像头视频流交互的各进程瞬时资源占用（CPU%为单核占用率）"
            >
              <About className="w-5" />
            </Button>
          </div>
          {!cameras ? (
            <ActivityIndicator />
          ) : (
            <div data-testid="cameras" className="grid grid-cols-1 3xl:grid-cols-3 md:grid-cols-2 gap-4">
              {cameraNames.map(
                (camera) =>
                  config.cameras[camera]['enabled'] && (
                    <div
                      key={camera}
                      className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow"
                    >
                      <div className="capitalize text-lg flex justify-between p-4">
                        <Link href={`/cameras/${camera}`}>{camera.replaceAll('_', ' ')}</Link>
                        <div className="flex">
                          {config.cameras[camera]['webui_url'] && (
                            <Button href={config.cameras[camera]['webui_url']} target="_blank">
                              Web UI
                              <WebUI className="ml-1 h-4 w-4" fill="white" stroke="white" />
                            </Button>
                          )}
                          <Button className="ml-2" onClick={(e) => onHandleFfprobe(camera, e)}>
                            ffprobe
                          </Button>
                        </div>
                      </div>
                      <div className="p-2">
                        <Table className="w-full">
                          <Thead>
                            <Tr>
                              <Th>进程</Th>
                              <Th>进程ID</Th>
                              <Th>帧率</Th>
                              <Th>CPU占用</Th>
                              <Th>内存占用</Th>
                              {config.telemetry.network_bandwidth && <Th>Network Bandwidth</Th>}
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr key="ffmpeg" index="0">
                              <Td>
                                视频解码
                                <Button
                                  className="rounded-full"
                                  type="text"
                                  color="gray"
                                  aria-label={cpu_usages[cameras[camera]['ffmpeg_pid']]?.['cmdline']}
                                  onClick={() => copy(cpu_usages[cameras[camera]['ffmpeg_pid']]?.['cmdline'])}
                                >
                                  <About className="w-3" />
                                </Button>
                              </Td>
                              <Td>{cameras[camera]['ffmpeg_pid'] || '- '}</Td>
                              <Td>{cameras[camera]['camera_fps'] || '- '}</Td>
                              <Td>{cpu_usages[cameras[camera]['ffmpeg_pid']]?.['cpu'] || '- '}%</Td>
                              <Td>{cpu_usages[cameras[camera]['ffmpeg_pid']]?.['mem'] || '- '}%</Td>
                              {config.telemetry.network_bandwidth && (
                                <Td>{bandwidth_usages[cameras[camera]['ffmpeg_pid']]?.['bandwidth'] || '- '}KB/s</Td>
                              )}
                            </Tr>
                            <Tr key="capture" index="1">
                              <Td>视频采集</Td>
                              <Td>{cameras[camera]['capture_pid'] || '- '}</Td>
                              <Td>{cameras[camera]['process_fps'] || '- '}</Td>
                              <Td>{cpu_usages[cameras[camera]['capture_pid']]?.['cpu'] || '- '}%</Td>
                              <Td>{cpu_usages[cameras[camera]['capture_pid']]?.['mem'] || '- '}%</Td>
                              {config.telemetry.network_bandwidth && <Td>-</Td>}
                            </Tr>
                            <Tr key="detect" index="2">
                              <Td>目标检测</Td>
                              <Td>{cameras[camera]['pid'] || '- '}</Td>

                              {(() => {
                                if (cameras[camera]['pid'] && cameras[camera]['detection_enabled'] == 1)
                                  return (
                                    <Td>
                                      {cameras[camera]['detection_fps']} ({cameras[camera]['skipped_fps']} skipped)
                                    </Td>
                                  );
                                else if (cameras[camera]['pid'] && cameras[camera]['detection_enabled'] == 0)
                                  return <Td>disabled</Td>;

                                return <Td>- </Td>;
                              })()}

                              <Td>{cpu_usages[cameras[camera]['pid']]?.['cpu'] || '- '}%</Td>
                              <Td>{cpu_usages[cameras[camera]['pid']]?.['mem'] || '- '}%</Td>
                              {config.telemetry.network_bandwidth && <Td>-</Td>}
                            </Tr>
                          </Tbody>
                        </Table>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}

          <div className="flex justify-start">
            <Heading className="self-center" size="lg">
              其他进程
            </Heading>
            <Button
              className="rounded-full"
              type="text"
              color="gray"
              aria-label="其他重要进程的瞬时资源占用（CPU%为单核占用率）"
            >
              <About className="w-5" />
            </Button>
          </div>
          <div data-testid="cameras" className="grid grid-cols-1 3xl:grid-cols-3 md:grid-cols-2 gap-4">
            {processesNames.map((process) => (
              <div key={process} className="dark:bg-gray-800 shadow-md hover:shadow-lg rounded-lg transition-shadow">
                <div className="capitalize text-lg flex justify-between p-4">
                  <div className="text-lg flex justify-between">{process}</div>
                </div>
                <div className="p-2">
                  <Table className="w-full">
                    <Thead>
                      <Tr>
                        <Th>进程ID</Th>
                        <Th>CPU占用</Th>
                        <Th>平均CPU占用</Th>
                        <Th>内存占用</Th>
                        {config.telemetry.network_bandwidth && <Th>Network Bandwidth</Th>}
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr key="other" index="0">
                        <Td>{processes[process]['pid'] || '- '}</Td>
                        <Td>{cpu_usages[processes[process]['pid']]?.['cpu'] || '- '}%</Td>
                        <Td>{cpu_usages[processes[process]['pid']]?.['cpu_average'] || '- '}%</Td>
                        <Td>{cpu_usages[processes[process]['pid']]?.['mem'] || '- '}%</Td>
                        {config.telemetry.network_bandwidth && (
                          <Td>{bandwidth_usages[processes[process]['pid']]?.['bandwidth'] || '- '}KB/s</Td>
                        )}
                      </Tr>
                    </Tbody>
                  </Table>
                </div>
              </div>
            ))}
          </div>

          <p>系统统计信息每 {config.mqtt.stats_interval} 秒自动更新一次。</p>
        </Fragment>
      )}
    </div>
  );
}
