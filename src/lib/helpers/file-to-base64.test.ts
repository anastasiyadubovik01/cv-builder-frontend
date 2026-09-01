import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fileToBase64 } from '@/lib/helpers/file-to-base64';

describe('fileToBase64', () => {
  let readAsDataURLMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    readAsDataURLMock = vi.fn();

    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      error: DOMException | null = null;
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL = readAsDataURLMock;
    }

    vi.stubGlobal('FileReader', MockFileReader);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('successfully converts a File to a base64 data URL string', async () => {
    const mockResult = 'data:text/plain;base64,SGVsbG8gd29ybGQ=';

    readAsDataURLMock.mockImplementation(function (this: {
      result: string;
      onload: ((event: ProgressEvent<FileReader>) => void) | null;
    }) {
      this.result = mockResult;
      this.onload?.({} as ProgressEvent<FileReader>);
    });

    const fakeFile = new File(['hello world'], 'test.txt', {
      type: 'text/plain',
    });
    const result = await fileToBase64(fakeFile);

    expect(result).toBe(mockResult);
  });

  it('rejects with an error when reader.result is not a string', async () => {
    readAsDataURLMock.mockImplementation(function (this: {
      result: ArrayBuffer;
      onload: ((event: ProgressEvent<FileReader>) => void) | null;
    }) {
      this.result = new ArrayBuffer(8);
      this.onload?.({} as ProgressEvent<FileReader>);
    });

    const fakeFile = new File(['buffer data'], 'test.bin', {
      type: 'application/octet-stream',
    });

    await expect(fileToBase64(fakeFile)).rejects.toThrow('Failed to read file');
  });

  it('rejects with reader.error when reader.onerror is triggered', async () => {
    const mockError = new DOMException(
      'File reading error',
      'NotReadableError',
    );

    readAsDataURLMock.mockImplementation(function (this: {
      error: DOMException;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null;
    }) {
      this.error = mockError;
      this.onerror?.({} as ProgressEvent<FileReader>);
    });

    const fakeFile = new File(['error data'], 'error.txt', {
      type: 'text/plain',
    });

    await expect(fileToBase64(fakeFile)).rejects.toThrow('File reading error');
  });
});
