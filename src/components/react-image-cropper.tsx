import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as AntdImage, Input, message, Modal, Spin, Upload } from "antd";
import Cropper from "react-cropper";
import compressImage from "../util.ts";

/**
 * 上传图片并压缩图片至指定尺寸的过程
 * 1. 通过 input 标签得到图片；
 * 2. react-cropper 按照裁剪比例 aspectRatio，得到裁剪后的图片 base64 地址；
 * 3. 使用 canvas 将 base64 地址，转为指定的尺寸；（虽然第2步进行了裁剪，但尺寸还依然很大）
 * 4. 将转为指定尺寸的base64地址，转为File对象；
 * 5. 通过接口上传该地址，得到线上地址；
 */

interface ReactImageCropper {
  width?: number; // 最终要生成图片的宽度和高度
  height?: number;
  aspectRatio?: number; // 裁剪比例，若设置了width和height，则该字段失效，若都没有设置，默认宽高比是1
  // form表单自带的字段
  [key: string]: any;
}

const ReactImageCropper = ({
  width,
  height,
  aspectRatio,
  children,
  ...rest
}: ReactImageCropper) => {
  const [loading, setLoading] = useState(false);
  const cropperRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [originalUrl, setOriginalUrl] = useState(""); // 刚上传得到的原始图片地址
  const [tempUrl, setTempUrl] = useState(""); // 中间压缩过程产生的url
  const tempUrlRef = useRef("");
  const onOkRef = useRef();

  const aspect = useMemo(() => {
    if (width && height) {
      return width / height;
    }
    if (aspectRatio) {
      return aspectRatio;
    }
    return 1;
  }, [aspectRatio, width, height]);

  const handleChange = (event: any) => {
    // const file = event.target.files[0];
    // inputRef.current.value = '';
    console.log("event", event);
    const { file } = event;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setOriginalUrl(reader.result as string);
    };
    reader.onerror = () => {
      message.error("读取文件失败");
    };
  };

  // 剪切时
  const onCrop = () => {
    const cropper: any = cropperRef?.current?.cropper;
    if (!cropper) {
      return;
    }
    const src = cropper.getCroppedCanvas().toDataURL();

    // setTempUrl(src);
    tempUrlRef.current = src;
  };

  /**
   * 获取图片最终的宽高
   * 若传入了宽高的数值，则直接使用；否则就使用裁剪出来的尺寸
   */
  const getImageFinalSize = (): Promise<{ width: number; height: number }> => {
    if (width && height) {
      return Promise.resolve({ width, height });
    }
    const img = new Image();
    return new Promise((resolve) => {
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = tempUrlRef.current;
    });
  };

  const handleComporess = async () => {
    const { width, height } = await getImageFinalSize();
    console.log(width, height);

    const file = await compressImage({
      info: { base64: tempUrlRef.current },
      width,
      height,
    });

    // 该上传该文件了
    console.log("file", file);
  };

  const uploadComponent = useMemo(() => {
    if (typeof children === "function") {
      return children({ originalUrl, handleChange });
    }
    if (!children) {
      return children;
    }

    const { accept, beforeUpload, ...restUploadProps } = children.props;

    const innerBeforeUpload = (file, fileList) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setOriginalUrl(reader.result as string);
        };
        reader.onerror = () => {
          message.error("读取文件失败");
        };

        onOkRef.current = async () => {
          const { width, height } = await getImageFinalSize();
          console.log(width, height);

          const newFile = await compressImage({
            info: { base64: tempUrlRef.current },
            width,
            height,
          });
          if (typeof beforeUpload !== "function") {
            resolve(newFile);
            return;
          }

          try {
            // https://github.com/ant-design/ant-design/blob/master/components/upload/Upload.tsx#L128-L148
            // https://ant.design/components/upload-cn#api
            const result = await beforeUpload(newFile, [newFile]);
            const value = result === true ? newFile : result;
            resolve(value);
          } catch (err) {
            resolve(err);
          }
        };
      });
    };

    return {
      ...children,
      props: {
        ...restUploadProps,
        ...rest,
        accept: accept || "image/*",
        beforeUpload: innerBeforeUpload,
      },
    };
    // return React.cloneElement(children, {
    //   ...restUploadProps,
    //   // ...rest,
    //   accept: accept || "image/*",
    //   beforeUpload: innerBeforeUpload,
    // });
  }, [children, rest, getImageFinalSize]);

  console.log("rest", rest, children, uploadComponent);

  return (
    <div>
      <Spin spinning={loading}>
        <Upload
          accept="image/*"
          listType="picture-card"
          showUploadList={false}
          customRequest={handleChange}
        >
          上传
        </Upload>
      </Spin>

      <Modal
        open={Boolean(originalUrl)}
        onCancel={() => setOriginalUrl("")}
        destroyOnClose
        maskClosable={false}
        width={600}
        onOk={handleComporess}
      >
        <Cropper
          cropend={onCrop}
          // crop={_.debounce(onCrop, 600)}
          ref={cropperRef}
          src={originalUrl}
          viewMode={1}
          aspectRatio={aspect}
          style={{ height: 400, width: "100%" }}
          guides={false}
        />
      </Modal>
    </div>
  );
};
export default ReactImageCropper;
