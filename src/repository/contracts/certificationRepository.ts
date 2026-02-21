import type {
  Certification,
  CertificationListQueryParams,
  CreateCertificationInput,
  UpdateCertificationInput,
} from "../../model";

export interface CertificationRepository {
  getMaxSortOrder(): Promise<number>;
  findAll(params?: CertificationListQueryParams): Promise<Certification[]>;
  findById(id: number): Promise<Certification | null>;
  findActive(): Promise<Certification[]>;
  createCertification(input: CreateCertificationInput): Promise<Certification>;
  updateCertification(id: number, input: UpdateCertificationInput): Promise<Certification>;
  deleteCertification(id: number): Promise<number>;
  updateSort(ids: number[], updatedBy: number): Promise<void>;
}

