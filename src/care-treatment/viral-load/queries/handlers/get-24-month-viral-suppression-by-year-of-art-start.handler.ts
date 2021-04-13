import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Get24MonthViralSuppressionByYearOfArtStartQuery } from '../impl/get-24-month-viral-suppression-by-year-of-art-start.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransVlSuppressionArtStart } from '../../entities/fact-trans-vl-suppression-art-start.model';
import { Repository } from 'typeorm';

@QueryHandler(Get24MonthViralSuppressionByYearOfArtStartQuery)
export class Get24MonthViralSuppressionByYearOfArtStartHandler implements IQueryHandler<Get24MonthViralSuppressionByYearOfArtStartQuery> {
    constructor(
        @InjectRepository(FactTransVlSuppressionArtStart, 'mssql')
        private readonly repository: Repository<FactTransVlSuppressionArtStart>
    ) {
    }

    async execute(query: Get24MonthViralSuppressionByYearOfArtStartQuery): Promise<any> {
        const twentyFourMonthViralSupByYearOfArtStart = this.repository.createQueryBuilder('f')
            .select(['StartYear startYear, SUM(VLAt24Months) vlAt24Months_Sup, CASE WHEN SUM(VLAt24Months) = 0 THEN 0 ELSE (CAST(SUM(VLAt24Months_Sup) as float)/CAST(SUM(VLAt24Months) as float)) END percentAt24Months'])
            .where('f.MFLCode > 1')
            .andWhere('f.StartYear >= 2011');

        if (query.county) {
            twentyFourMonthViralSupByYearOfArtStart.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            twentyFourMonthViralSupByYearOfArtStart.andWhere('f.Subcounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            twentyFourMonthViralSupByYearOfArtStart.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            twentyFourMonthViralSupByYearOfArtStart.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await twentyFourMonthViralSupByYearOfArtStart
            .groupBy('f.StartYear')
            .orderBy('StartYear')
            .getRawMany();
    }
}
