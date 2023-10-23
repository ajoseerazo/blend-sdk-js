import { Resources } from '../src/contract_result';

test('resource extraction from xdr', () => {
  const xdr_string =
    'AAAAAgAAAAB/m3Gd2f4Prkc5mvVnWAMsXFuq18mO6rFiiSfrkfEAWQAG4GAAAIM/AAAAWwAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAGAAAAAAAAAABuLOIaAaK2XieV4UrQETLmq0JVyrmNXg+Egt1YIZiLacAAAAJam9pbl9wb29sAAAAAAAAAwAAAAoAAAAAAAAAAAAAAOjUpRAAAAAAEAAAAAEAAAACAAAACgAAAAAAAAAAAAAJGqJ+hAAAAAAKAAAAAAAAAAAAAAA6NcHagAAAABIAAAAAAAAAAH+bcZ3Z/g+uRzma9WdYAyxcW6rXyY7qsWKJJ+uR8QBZAAAAAQAAAAAAAAAAAAAAAbiziGgGitl4nleFK0BEy5qtCVcq5jV4PhILdWCGYi2nAAAACWpvaW5fcG9vbAAAAAAAAAMAAAAKAAAAAAAAAAAAAADo1KUQAAAAABAAAAABAAAAAgAAAAoAAAAAAAAAAAAACRqifoQAAAAACgAAAAAAAAAAAAAAOjXB2oAAAAASAAAAAAAAAAB/m3Gd2f4Prkc5mvVnWAMsXFuq18mO6rFiiSfrkfEAWQAAAAAAAAABAAAAAAAAAAUAAAAGAAAAAapP5zAt/ZBU77WhOGcGQgp2/m1qxylrvk56/wcS25MkAAAAFAAAAAEAAAAGAAAAAbiziGgGitl4nleFK0BEy5qtCVcq5jV4PhILdWCGYi2nAAAAEAAAAAEAAAABAAAADwAAAAtBbGxUb2tlblZlYwAAAAABAAAABgAAAAG4s4hoBorZeJ5XhStARMuarQlXKuY1eD4SC3VghmItpwAAABQAAAABAAAABgAAAAHQfc3fIc3mKWfUwZp3Q31UPu6iBwe0v66S+TU7zgtPIwAAABQAAAABAAAAB88GmZfMlWd8jthdZ1R9wpG0UCc7DKiUDq6heruLF6laAAAACQAAAAEAAAAAf5txndn+D65HOZr1Z1gDLFxbqtfJjuqxYokn65HxAFkAAAABQkxORAAAAAAqHq40QJgiUPwd1puHNo5mvaZNawfRSbr+z4jQje7OiwAAAAEAAAAAf5txndn+D65HOZr1Z1gDLFxbqtfJjuqxYokn65HxAFkAAAABVVNEQwAAAAAqHq40QJgiUPwd1puHNo5mvaZNawfRSbr+z4jQje7OiwAAAAYAAAABqk/nMC39kFTvtaE4ZwZCCnb+bWrHKWu+Tnr/BxLbkyQAAAAQAAAAAQAAAAIAAAAPAAAACUFsbG93YW5jZQAAAAAAABEAAAABAAAAAgAAAA8AAAAEZnJvbQAAABIAAAAAAAAAAH+bcZ3Z/g+uRzma9WdYAyxcW6rXyY7qsWKJJ+uR8QBZAAAADwAAAAdzcGVuZGVyAAAAABIAAAABuLOIaAaK2XieV4UrQETLmq0JVyrmNXg+Egt1YIZiLacAAAAAAAAABgAAAAGqT+cwLf2QVO+1oThnBkIKdv5tascpa75Oev8HEtuTJAAAABAAAAABAAAAAgAAAA8AAAAHQmFsYW5jZQAAAAASAAAAAbiziGgGitl4nleFK0BEy5qtCVcq5jV4PhILdWCGYi2nAAAAAQAAAAYAAAABuLOIaAaK2XieV4UrQETLmq0JVyrmNXg+Egt1YIZiLacAAAAQAAAAAQAAAAEAAAAPAAAADUFsbFJlY29yZERhdGEAAAAAAAABAAAABgAAAAG4s4hoBorZeJ5XhStARMuarQlXKuY1eD4SC3VghmItpwAAABAAAAABAAAAAgAAAA8AAAAHQmFsYW5jZQAAAAASAAAAAAAAAAB/m3Gd2f4Prkc5mvVnWAMsXFuq18mO6rFiiSfrkfEAWQAAAAEAAAAGAAAAAbiziGgGitl4nleFK0BEy5qtCVcq5jV4PhILdWCGYi2nAAAAEAAAAAEAAAABAAAADwAAAAtUb3RhbFNoYXJlcwAAAAABAAAABgAAAAHQfc3fIc3mKWfUwZp3Q31UPu6iBwe0v66S+TU7zgtPIwAAABAAAAABAAAAAgAAAA8AAAAJQWxsb3dhbmNlAAAAAAAAEQAAAAEAAAACAAAADwAAAARmcm9tAAAAEgAAAAAAAAAAf5txndn+D65HOZr1Z1gDLFxbqtfJjuqxYokn65HxAFkAAAAPAAAAB3NwZW5kZXIAAAAAEgAAAAG4s4hoBorZeJ5XhStARMuarQlXKuY1eD4SC3VghmItpwAAAAAAAAAGAAAAAdB9zd8hzeYpZ9TBmndDfVQ+7qIHB7S/rpL5NTvOC08jAAAAEAAAAAEAAAACAAAADwAAAAdCYWxhbmNlAAAAABIAAAABuLOIaAaK2XieV4UrQETLmq0JVyrmNXg+Egt1YIZiLacAAAABAaHMgQAAm/QAAAe4AAAAAAAAJWIAAAABkfEAWQAAAECEgd+5Bqo+pQmxF4cnUMGI2wGyEN43yZJNdQ/oRFddt8Yw6O7lXKRqnu4BgHIqqG5VQK3N/w6c3VV4SAJtCxoE';
  const resouces = Resources.fromTransaction(xdr_string);
  expect(resouces.fee).toEqual(450656);
  expect(resouces.cpuInst).toEqual(27380865);
  expect(resouces.readBytes).toEqual(39924);
  expect(resouces.writeBytes).toEqual(1976);
  expect(resouces.readOnlyEntries).toEqual(5);
  expect(resouces.readWriteEntries).toEqual(9);
});