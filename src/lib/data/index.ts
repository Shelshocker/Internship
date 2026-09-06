import { DataReader } from './types';
import { CsvDataReader } from './csv-data-reader';
import { MockDataReader } from './mock-data-reader';
import { RedshiftDataReader } from './redshift-data-reader';

export function getDataReader(): DataReader {
  const source = (process.env.DATA_SOURCE || 'CSV').toUpperCase();
  switch (source) {
    case 'REDSHIFT':
      return new RedshiftDataReader();
    case 'MOCK':
      return new MockDataReader();
    case 'CSV':
    default:
      return new CsvDataReader();
  }
}

export * from './types';
