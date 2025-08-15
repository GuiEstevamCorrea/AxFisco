import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCustomerUseCase } from '@application/use-cases/create-customer.use-case';
import { CreateCustomerDto, UpdateCustomerDto } from '@application/dtos/customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Cliente já existe' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    try {
      const customer = await this.createCustomerUseCase.execute(createCustomerDto);
      return {
        success: true,
        data: customer,
        message: 'Cliente criado com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  async findAll() {
    // TODO: Implementar caso de uso para listar clientes
    return {
      success: true,
      data: [],
      message: 'Clientes listados com sucesso',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string) {
    // TODO: Implementar caso de uso para buscar cliente por ID
    return {
      success: true,
      data: null,
      message: 'Cliente encontrado',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    // TODO: Implementar caso de uso para atualizar cliente
    return {
      success: true,
      data: null,
      message: 'Cliente atualizado com sucesso',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir cliente' })
  @ApiResponse({ status: 200, description: 'Cliente excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remove(@Param('id') id: string) {
    // TODO: Implementar caso de uso para excluir cliente
    return {
      success: true,
      message: 'Cliente excluído com sucesso',
    };
  }
}
