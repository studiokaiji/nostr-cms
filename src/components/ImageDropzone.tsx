import { Flex, Box, Image, useMantineTheme, SimpleGrid } from "@mantine/core";

import { Dropzone, FileWithPath } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";

import { IconPhoto } from "@tabler/icons-react";

type ImageDropzoneProps = {
  defaultImage?: string;
  files: FileWithPath[];
  onChangeFiles: (files: FileWithPath[]) => void;
  multiple?: boolean;
  width?: number;
  height?: number;
};

export const ImageDropzone = ({
  defaultImage,
  files,
  onChangeFiles,
  multiple,
}: ImageDropzoneProps) => {
  const theme = useMantineTheme();

  return (
    <Box>
      <Dropzone
        onDrop={onChangeFiles}
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
            width: 240,
            height: 160,
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
          if (files.length > 0 && !multiple) {
            const imageUrl = URL.createObjectURL(files[0]);
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
                src={defaultImage || imageUrl}
                onLoad={() => URL.revokeObjectURL(imageUrl)}
              />
            );
          }
        })()}
      </Dropzone>
      <SimpleGrid
        cols={{ base: 1, sm: 4 }}
        mt={files.length > 0 && multiple ? "xl" : 0}
      >
        {multiple &&
          files.map((file, index) => {
            const imageUrl = URL.createObjectURL(file);
            return (
              <Image
                key={index}
                src={imageUrl}
                onLoad={() => URL.revokeObjectURL(imageUrl)}
              />
            );
          })}
      </SimpleGrid>
    </Box>
  );
};
