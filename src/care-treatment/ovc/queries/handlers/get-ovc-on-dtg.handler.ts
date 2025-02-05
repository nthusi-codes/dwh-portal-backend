import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOvcOnDtgQuery } from '../impl/get-ovc-on-dtg.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOvcEnrollments } from '../../entities/fact-trans-ovc-enrollments.model';
import { Repository } from 'typeorm';
import { FactTransOtzOutcome } from '../../../otz/entities/fact-trans-otz-outcome.model';

@QueryHandler(GetOvcOnDtgQuery)
export class GetOvcOnDtgHandler implements IQueryHandler<GetOvcOnDtgQuery> {
    constructor(
        @InjectRepository(FactTransOvcEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzOutcome>
    ) {
    }

    async execute(query: GetOvcOnDtgQuery): Promise<any> {
        const OVConDTG = this.repository.createQueryBuilder('f')
            .select(['Count (*)OVConDTG'])
            .andWhere('f.LastRegimen <>\'non DTG\' and f.OVCEnrollmentDate IS NOT NULL and f.TXCurr=1');

        if (query.county) {
            OVConDTG.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            OVConDTG.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            OVConDTG.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            OVConDTG.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        if (query.agency) {
            OVConDTG.andWhere('f.CTAgency IN (:...agencies)', { agencies: query.agency });
        }

        if (query.gender) {
            OVConDTG.andWhere('f.Gender IN (:...genders)', { genders: query.gender });
        }

        if (query.datimAgeGroup) {
            OVConDTG.andWhere('f.DATIM_AgeGroup IN (:...ageGroups)', { ageGroups: query.datimAgeGroup });
        }

        return await OVConDTG.getRawOne();
    }
}
