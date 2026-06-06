"""API v1 emergency contact management."""

from fastapi import APIRouter, Depends, Response, status

from app.dependencies import get_current_user
from app.schemas.emergency_contacts import EmergencyContactResponse, EmergencyContactWrite
from app.services.emergency_contact_service import (
	create_emergency_contact,
	delete_emergency_contact,
	list_emergency_contacts,
	update_emergency_contact,
)

router = APIRouter(prefix="/emergency/contacts", tags=["Emergency contacts v1"])


@router.get("")
async def get_contacts(
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	contacts = list_emergency_contacts(current_user["id"])
	return {"success": True, "message": "Emergency contacts fetched", "data": contacts}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_contact(
	payload: EmergencyContactWrite,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	contact = EmergencyContactResponse(**create_emergency_contact(current_user["id"], payload))
	return {"success": True, "message": "Emergency contact created", "data": contact.model_dump()}


@router.put("/{contact_id}")
async def update_contact(
	contact_id: str,
	payload: EmergencyContactWrite,
	current_user: dict = Depends(get_current_user),
) -> dict[str, object]:
	contact = EmergencyContactResponse(**update_emergency_contact(current_user["id"], contact_id, payload))
	return {"success": True, "message": "Emergency contact updated", "data": contact.model_dump()}


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
	contact_id: str,
	current_user: dict = Depends(get_current_user),
) -> Response:
	delete_emergency_contact(current_user["id"], contact_id)
	return Response(status_code=status.HTTP_204_NO_CONTENT)
