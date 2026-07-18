import { ApplicationRepository } from "../repositories/application.repository";
import { Prisma } from "@prisma/client";
export class ApplicationService {
    private repository = new ApplicationRepository();

    async create(data: Prisma.ApplicationUncheckedCreateInput) {
        return this.repository.create(data);
    }
}
