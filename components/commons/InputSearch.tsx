import { Search } from 'lucide-react';
import React, { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { useUpdateData } from '@/hooks/useUpdateData';
import { GridItem } from '@/types/gridItem';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent } from '../ui/popover';

type Props = {
  data: GridItem;
  style?: CSSProperties;
  value?: any[];
};

type TForm = {
  inputSearch: string;
};

const InputSearch: React.FC<Props> = ({ data, style, value }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { dataState } = useHandleData({ dataProp: data.data });
  console.log('🚀 ~ dataState:', dataState);
  const inputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<TForm>({
    defaultValues: {
      inputSearch: '',
    },
    values: {
      inputSearch: dataState || '',
    },
  });
  const { control, handleSubmit } = methods;
  const { handleAction } = useActions(data);
  const { updateData } = useUpdateData({ dataProp: data.data });

  const onSubmit = (data: TForm) => {
    updateData(data.inputSearch);
    handleAction('onClick');
  };
  const inputSearch = useWatch({
    control,
    name: 'inputSearch',
  });

  useEffect(() => {
    setLoading(true);

    Promise.resolve(updateData(inputSearch))
      .then(() => {
        handleAction('onChange');
      })
      .catch((error) => {
        console.error('Error in handleAction:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);

  return (
    <FormProvider {...methods}>
      <div className="" style={style}>
        <div className="flex justify-center items-center gap-2 relative">
          <Controller
            name="inputSearch"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                ref={(node) => {
                  field.ref(node);
                  inputRef.current = node;
                }}
              />
            )}
          />

          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={handleSubmit(onSubmit)}
          >
            <Search />
          </Button>
          <PopoverSearch inputRef={inputRef} values={value || []} isLoading={loading} />
        </div>
      </div>
    </FormProvider>
  );
};

const PopoverSearch: FC<{
  inputRef: React.RefObject<HTMLInputElement>;
  values: any[];
  isLoading?: boolean;
}> = ({ inputRef, values, isLoading = false }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const { control, setValue } = useFormContext<TForm>();
  const inputSearch = useWatch({ control, name: 'inputSearch' });

  const handle = useDebouncedCallback(() => {
    // Don't open popup if we're in the middle of selecting a value
    if (inputSearch && !isSelecting) {
      setOpen(true);
    } else if (!inputSearch) {
      setOpen(false);
    }
  }, 300);

  useEffect(() => {
    handle();
  }, [inputSearch, handle]);

  const handleClick = (value: string) => {
    setIsSelecting(true);
    setValue('inputSearch', value);
    setOpen(false);

    // Reset the selecting flag after a short delay to allow for normal typing behavior
    setTimeout(() => {
      setIsSelecting(false);
      inputRef.current?.focus();
    }, 100);
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (values?.length) {
      return (
        <>
          {values?.map((value: any, index: number) => (
            <Button
              key={index}
              variant="ghost"
              className="justify-start"
              onClick={() => handleClick(value)}
            >
              {value}
            </Button>
          ))}
        </>
      );
    }
    if (!values?.length && inputSearch) {
      return (
        <div className="flex justify-center items-center p-4">
          <p>No results found</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverContent
        className="w-80 h-80 overflow-auto absolute top-10"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col gap-2">{renderContent()}</div>
      </PopoverContent>
    </Popover>
  );
};

const Loading = () => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="p-2 animate-pulse bg-gray-200 rounded-md mb-2 h-8"></div>
      ))}
    </>
  );
};

export default InputSearch;
