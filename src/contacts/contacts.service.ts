import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto) {
    if (
      !createContactDto.name ||
      !createContactDto.email ||
      !createContactDto.phone
    ) {
      throw new BadRequestException('Email, name, and phone are required');
    }
    const existingContact = await this.contactRepository.findOne({
      where: { email: createContactDto.email },
    });
    if (existingContact) {
      throw new BadRequestException('Contact with this email already exists');
    }
    return this.contactRepository.save(createContactDto);
  }

  async findAll() {
    const [results, total] = await this.contactRepository.findAndCount();
    return {
      results,
      total,
    };
  }

  async findOne(id: string) {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return this.contactRepository.findOne({ where: { id } });
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const { name, email, phone } = updateContactDto;
    const contact = await this.contactRepository.findOne({
      where: { id },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    if (!name && !email && !phone) {
      throw new BadRequestException('No data provided to update');
    }
    const updatedContact = {
      ...contact,
      name: name || contact.name,
      email: email || contact.email,
      phone: phone || contact.phone,
    };
    await this.contactRepository.update(id, updatedContact);
    return updatedContact;
  }

  async remove(id: string) {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return this.contactRepository.delete(id);
  }
}
