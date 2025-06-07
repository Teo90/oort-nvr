import { h } from 'preact';
import ArrowDropdown from '../icons/ArrowDropdown';
import ArrowDropup from '../icons/ArrowDropup';
import Button from '../components/Button';
import Dialog from '../components/Dialog';
import Heading from '../components/Heading';
import Select from '../components/Select';
import Switch from '../components/Switch';
import TextField from '../components/TextField';
import { useCallback, useState } from 'preact/hooks';

export default function StyleGuide() {
  const [switches, setSwitches] = useState({ 0: false, 1: true, 2: false, 3: false });
  const [showDialog, setShowDialog] = useState(false);

  const handleSwitch = useCallback(
    (id, checked) => {
      setSwitches({ ...switches, [id]: checked });
    },
    [switches]
  );

  const handleDismissDialog = () => {
    setShowDialog(false);
  };

  return (
    <div className="p-2 px-4">
      <Heading size="md">按钮</Heading>
      <div className="flex space-x-4 mb-4">
        <Button>默认</Button>
        <Button color="red">危险</Button>
        <Button color="green">保存</Button>
        <Button color="gray">灰色</Button>
        <Button disabled>禁用</Button>
      </div>
      <div className="flex space-x-4 mb-4">
        <Button type="text">默认</Button>
        <Button color="red" type="text">
          危险
        </Button>
        <Button color="green" type="text">
          保存
        </Button>
        <Button color="gray" type="text">
          灰色
        </Button>
        <Button disabled type="text">
          禁用
        </Button>
      </div>
      <div className="flex space-x-4 mb-4">
        <Button type="outlined">默认</Button>
        <Button color="red" type="outlined">
          危险
        </Button>
        <Button color="green" type="outlined">
          保存
        </Button>
        <Button color="gray" type="outlined">
          灰色
        </Button>
        <Button disabled type="outlined">
          禁用
        </Button>
      </div>

      <Heading size="md">对话框</Heading>
      <Button
        onClick={() => {
          setShowDialog(true);
        }}
      >
        显示对话框
      </Button>
      {showDialog ? (
        <Dialog
          onDismiss={handleDismissDialog}
          title="这是一个对话框"
          text="你想查看更多吗？"
          actions={[
            { text: '是', color: 'red', onClick: handleDismissDialog },
            { text: '否', onClick: handleDismissDialog },
          ]}
        />
      ) : null}

      <Heading size="md">开关</Heading>
      <div className="flex-col space-y-4 max-w-4xl">
        <Switch label="禁用，关闭" labelPosition="after" />
        <Switch label="禁用，开启" labelPosition="after" checked />
        <Switch
          label="启用，（初始关闭）"
          labelPosition="after"
          checked={switches[0]}
          id={0}
          onChange={handleSwitch}
        />
        <Switch
          label="启用，（初始开启）"
          labelPosition="after"
          checked={switches[1]}
          id={1}
          onChange={handleSwitch}
        />

        <Switch checked={switches[2]} id={2} label="标签前" onChange={handleSwitch} />
        <Switch checked={switches[3]} id={3} label="标签后" labelPosition="after" onChange={handleSwitch} />
      </div>

      <Heading size="md">选择</Heading>
      <div className="flex space-x-4 mb-4 max-w-4xl">
        <Select label="基本选择框" options={['全部', '无', '其他']} selected="无" />
      </div>

      <Heading size="md">文本字段</Heading>
      <div className="flex-col space-y-4 max-w-4xl">
        <TextField label="默认文本字段" />
        <TextField label="预填充" value="这是我的预填充值" />
        <TextField label="带有帮助" helpText="这是一些帮助文本" />
        <TextField label="前置图标" leadingIcon={ArrowDropdown} />
        <TextField label="后置图标" trailingIcon={ArrowDropup} />
      </div>
    </div>
  );
}
