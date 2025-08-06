import { Metadata } from '@grpc/grpc-js';
import { Observable } from 'rxjs';

export const protobufPackage = 'character';

export interface CreateCharacterProfileRequest {
  userId: string;
  userName: string;
}

export interface CreateCharacterProfileResponse {
  characterId: string;
  characterName: string;
  characterTitle: string;
  level: number;
  exp: number;
  nextLevelExp: number;
}

export const RBAC_PACKAGE_NAME = 'rbac';

export interface CharacterServiceClient {
  createCharacterProfile(
    request: CreateCharacterProfileRequest,
    metadata: Metadata,
  ): Observable<CreateCharacterProfileResponse>;
}

export const CHARACTER_SERVICE_NAME = 'CharacterService';
