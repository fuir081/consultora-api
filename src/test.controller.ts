import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  test() {
    console.log('TEST OK');
    return {
      ok: true,
    };
  }
}
