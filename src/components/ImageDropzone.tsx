import { Flex, Box, Image, useMantineTheme, SimpleGrid } from "@mantine/core";

import { Dropzone, FileWithPath } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";

import { IconPhoto } from "@tabler/icons-react";

type ImageDropzoneProps = {
  images: string[];
  onChangeImages: (images: string[]) => void;
  multiple?: boolean;
  width?: number;
  height?: number;
};

export const ImageDropzone = ({
  images,
  onChangeImages,
  multiple,
  width = 240,
  height = 160,
}: ImageDropzoneProps) => {
  const theme = useMantineTheme();

  const drop = (files: FileWithPath[]) => {
    const images = files.map((file) => URL.createObjectURL(file));
    onChangeImages(images);
  };

  return (
    <Box>
      <Dropzone
        onDrop={drop}
        accept={[
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/avif",
          "image/heif",
        ]}
        styles={{
          root: {
            width,
            height,
            padding: 0,
          },
          inner: {
            height: "100%",
            position: "relative",
          },
        }}
        multiple={multiple}
      >
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <IconPhoto size={40} color={theme.colors.gray[5]} />
        </Flex>
        {(() => {
          if (images.length > 0 && !multiple) {
            const imageUrl = images[0];
            if (!imageUrl) return <></>;
            return (
              <Image
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: theme.radius.sm,
                }}
                fit="contain"
                src={imageUrl}
              />
            );
          }
        })()}
      </Dropzone>
      <SimpleGrid
        cols={{ base: 1, sm: 4 }}
        mt={images.length > 0 && multiple ? "xl" : 0}
      >
        {multiple &&
          images.map((imageUrl, index) => {
            return <Image key={index} src={imageUrl} />;
          })}
      </SimpleGrid>
    </Box>
  );
};
